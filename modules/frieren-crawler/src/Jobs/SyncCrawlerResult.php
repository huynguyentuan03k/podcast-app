<?php

namespace Frieren\Crawler\Jobs;

use Frieren\Crawler\Models\CrawlerAudioCandidate;
use Frieren\Crawler\Models\CrawlerJob;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Throwable;

final class SyncCrawlerResult implements ShouldQueue
{
    use Dispatchable;
    use InteractsWithQueue;
    use Queueable;
    use SerializesModels;

    public int $tries = 20;

    public function __construct(
        public readonly int $crawlerJobId,
    ) {
    }

    public function handle(): void
    {
        $crawlerJob = CrawlerJob::query()->findOrFail($this->crawlerJobId);

        if (!$crawlerJob->external_job_id) {
            return;
        }

        $baseUrl = rtrim(
            (string) config('frieren-crawler.service.base_url', 'http://127.0.0.1:3101'),
            '/',
        );

        $jobResponse = Http::timeout(15)->get(
            "{$baseUrl}/api/crawl-jobs/{$crawlerJob->external_job_id}",
        );

        if (!$jobResponse->successful()) {
            $this->release(5);
            return;
        }

        $remoteJob = $jobResponse->json();
        $status = strtoupper((string) ($remoteJob['status'] ?? ''));

        if (in_array($status, ['PENDING', 'RUNNING', 'FETCHED', 'NORMALIZED'], true)) {
            $crawlerJob->forceFill([
                'status' => strtolower($status),
            ])->save();

            $this->release(5);
            return;
        }

        if ($status === 'FAILED') {
            $crawlerJob->forceFill([
                'status' => 'failed',
                'error_message' => data_get($remoteJob, 'error.message', 'Crawler failed'),
                'response' => [
                    'job' => $remoteJob,
                    'validation' => null,
                    'normalized' => null,
                ],
                'finished_at' => now(),
            ])->save();

            return;
        }

        if (!in_array($status, ['COMPLETED', 'VALIDATED'], true)) {
            $this->release(5);
            return;
        }

        $resultResponse = Http::timeout(30)->get(
            "{$baseUrl}/api/crawl-jobs/{$crawlerJob->external_job_id}/result",
        );

        if (!$resultResponse->successful()) {
            $this->release(5);
            return;
        }

        $result = $resultResponse->json();

        $normalized = is_array($result['normalized'] ?? null)
            ? $result['normalized']
            : [];

        $validation = is_array($result['validation'] ?? null)
            ? $result['validation']
            : null;

        $episodes = is_array($normalized['episodes'] ?? null)
            ? $normalized['episodes']
            : [];

        $crawlerJob->forceFill([
            'status' => 'completed',
            'response' => [
                'job' => $result['job'] ?? $remoteJob,
                'validation' => $validation,
                'normalized' => array_merge($normalized, [
                    'episode_count' => count($episodes),
                ]),
            ],
            'error_message' => null,
            'finished_at' => now(),
        ])->save();

        $this->storeAudioCandidates($crawlerJob, $episodes);

        if ($crawlerJob->source) {
            $crawlerJob->source->forceFill([
                'last_crawled_at' => now(),
            ])->save();
        }
    }

    /**
     * @param array<int, mixed> $episodes
     */
    private function storeAudioCandidates(
        CrawlerJob $crawlerJob,
        array $episodes,
    ): void {
        foreach ($episodes as $index => $episode) {
            if (!is_array($episode)) {
                continue;
            }

            $audioUrl = $episode['audioUrl'] ?? null;

            if (!is_string($audioUrl) || $audioUrl === '') {
                continue;
            }

            CrawlerAudioCandidate::query()->updateOrCreate(
                [
                    'crawler_job_id' => $crawlerJob->id,
                    'audio_url' => $audioUrl,
                ],
                [
                    'crawler_source_id' => $crawlerJob->crawler_source_id,
                    'title' => $episode['title'] ?? 'Episode '.($index + 1),
                    'slug' => null,
                    'status' => 'pending',
                    'duration_seconds' => $episode['durationSeconds'] ?? null,
                    'metadata' => [
                        'position' => $episode['position'] ?? ($index + 1),
                        'external_id' => $episode['externalId'] ?? null,
                        'description' => $episode['description'] ?? null,
                    ],
                ],
            );
        }
    }

    public function failed(Throwable $exception): void
    {
        Log::error('Sync crawler result failed', [
            'crawler_job_id' => $this->crawlerJobId,
            'error' => $exception->getMessage(),
        ]);

        CrawlerJob::query()
            ->whereKey($this->crawlerJobId)
            ->update([
                'status' => 'failed',
                'error_message' => $exception->getMessage(),
                'finished_at' => now(),
            ]);
    }
}
