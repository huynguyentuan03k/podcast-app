<?php

namespace Frieren\Crawler\Jobs;

use Frieren\Crawler\Models\CrawlerItem;
use Frieren\Crawler\Models\CrawlerItemAudio;
use Frieren\Crawler\Models\CrawlerRun;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Throwable;

final class SyncCrawlerResult implements ShouldQueue
{
    use Dispatchable;
    use InteractsWithQueue;
    use Queueable;
    use SerializesModels;

    public int $tries = 20;

    public function __construct(
        public readonly int $crawlerRunId,
    ) {
    }

    public function handle(): void
    {
        $run = CrawlerRun::query()
            ->with(['source', 'items'])
            ->findOrFail($this->crawlerRunId);

        $externalJobId = data_get($run->cursor, 'external_job_id');

        if (! is_string($externalJobId) || $externalJobId === '') {
            return;
        }

        $baseUrl = rtrim(
            (string) config('frieren-crawler.service.base_url', 'http://127.0.0.1:3101'),
            '/',
        );

        $jobResponse = Http::timeout(15)->get("{$baseUrl}/api/crawl-jobs/{$externalJobId}");

        if (! $jobResponse->successful()) {
            $this->release(5);

            return;
        }

        $remoteJob = $jobResponse->json();
        $status = strtoupper((string) ($remoteJob['status'] ?? ''));

        if (in_array($status, ['PENDING', 'RUNNING', 'FETCHED', 'NORMALIZED'], true)) {
            $run->forceFill([
                'status' => 'running',
                'started_at' => $run->started_at ?? now(),
            ])->save();

            $this->release(5);

            return;
        }

        $item = $this->resolveRunItem($run);

        if ($status === 'FAILED') {
            $message = data_get($remoteJob, 'error.message', 'Crawler failed');

            $run->forceFill([
                'status' => 'failed',
                'failed_count' => 1,
                'error_message' => $message,
                'finished_at' => now(),
            ])->save();

            $item?->forceFill([
                'status' => 'failed',
                'error_message' => $message,
                'failure_count' => ($item->failure_count ?? 0) + 1,
                'last_crawled_at' => now(),
            ])->save();

            return;
        }

        if (! in_array($status, ['COMPLETED', 'VALIDATED'], true)) {
            $this->release(5);

            return;
        }

        $resultResponse = Http::timeout(30)->get("{$baseUrl}/api/crawl-jobs/{$externalJobId}/result");

        if (! $resultResponse->successful()) {
            $this->release(5);

            return;
        }

        $result = $resultResponse->json();
        $normalized = is_array($result['normalized'] ?? null) ? $result['normalized'] : [];
        $validation = is_array($result['validation'] ?? null) ? $result['validation'] : [];
        $episodes = is_array($normalized['episodes'] ?? null) ? $normalized['episodes'] : [];
        $now = now();

        if ($item) {
            $item->forceFill([
                'title' => data_get($normalized, 'title', $item->title),
                'normalized_title' => Str::of((string) data_get($normalized, 'title', $item->title))->lower()->squish()->toString(),
                'description' => data_get($normalized, 'description', $item->description),
                'thumbnail_url' => data_get($normalized, 'coverImageUrl', $item->thumbnail_url),
                'canonical_url' => data_get($normalized, 'source.url', $item->canonical_url),
                'canonical_url_hash' => data_get($normalized, 'source.url') ? hash('sha256', (string) data_get($normalized, 'source.url')) : $item->canonical_url_hash,
                'status' => empty($episodes) ? 'failed' : 'ready',
                'audio_count' => count($episodes),
                'metadata' => [
                    'validation' => $validation,
                    'warnings' => data_get($normalized, 'warnings', []),
                    'source' => data_get($normalized, 'source'),
                    'category' => data_get($normalized, 'category'),
                    'authors' => data_get($normalized, 'authors', []),
                    'narrator' => data_get($normalized, 'narrator'),
                ],
                'error_message' => empty($episodes) ? 'Crawler completed without audio episodes.' : null,
                'crawl_count' => ($item->crawl_count ?? 0) + 1,
                'failure_count' => empty($episodes) ? ($item->failure_count ?? 0) + 1 : $item->failure_count,
                'last_crawled_at' => $now,
                'last_changed_at' => $now,
            ])->save();

            $this->storeItemAudios($item, $run, $episodes);
        }

        $run->forceFill([
            'status' => empty($episodes) ? 'failed' : 'completed',
            'processed_count' => 1,
            'created_count' => $item ? CrawlerItemAudio::query()->where('crawler_item_id', $item->id)->count() : 0,
            'failed_count' => empty($episodes) ? 1 : 0,
            'options' => array_merge($run->options ?? [], [
                'remote_job' => $result['job'] ?? $remoteJob,
                'validation' => $validation,
            ]),
            'error_message' => empty($episodes) ? 'Crawler completed without audio episodes.' : null,
            'finished_at' => $now,
        ])->save();

        $run->source?->forceFill([
            'last_crawled_at' => $now,
        ])->save();
    }

    private function resolveRunItem(CrawlerRun $run): ?CrawlerItem
    {
        $itemId = data_get($run->cursor, 'crawler_item_id');

        if (is_numeric($itemId)) {
            return CrawlerItem::query()->find((int) $itemId);
        }

        return $run->items()->first();
    }

    /**
     * @param array<int, mixed> $episodes
     */
    private function storeItemAudios(CrawlerItem $item, CrawlerRun $run, array $episodes): void
    {
        foreach ($episodes as $index => $episode) {
            if (! is_array($episode)) {
                continue;
            }

            $audioUrl = $episode['audioUrl'] ?? null;

            if (! is_string($audioUrl) || $audioUrl === '') {
                continue;
            }

            CrawlerItemAudio::query()->updateOrCreate(
                [
                    'crawler_item_id' => $item->id,
                    'audio_url_hash' => hash('sha256', $audioUrl),
                ],
                [
                    'last_crawler_run_id' => $run->id,
                    'external_id' => $episode['externalId'] ?? null,
                    'title' => $episode['title'] ?? 'Episode ' . ($index + 1),
                    'position' => $episode['position'] ?? ($index + 1),
                    'audio_url' => $audioUrl,
                    'duration_seconds' => $episode['durationSeconds'] ?? null,
                    'status' => 'active',
                    'metadata' => [
                        'description' => $episode['description'] ?? null,
                    ],
                    'error_message' => null,
                    'crawl_count' => 1,
                    'first_discovered_at' => now(),
                    'last_crawled_at' => now(),
                    'last_changed_at' => now(),
                ],
            );
        }
    }

    public function failed(Throwable $exception): void
    {
        Log::error('Sync crawler result failed', [
            'crawler_run_id' => $this->crawlerRunId,
            'error' => $exception->getMessage(),
        ]);

        CrawlerRun::query()
            ->whereKey($this->crawlerRunId)
            ->update([
                'status' => 'failed',
                'error_message' => $exception->getMessage(),
                'finished_at' => now(),
            ]);
    }
}
