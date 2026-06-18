<?php

namespace Frieren\Crawler\Jobs;

use Frieren\Crawler\Models\CrawlerItem;
use Frieren\Crawler\Models\CrawlerItemAsset;
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
        $assets = $this->extractAssets($normalized);
        $hasContent = $this->hasNormalizedContent($normalized, $episodes, $assets);
        $now = now();

        if ($item) {
            $item->forceFill([
                'item_type' => $this->inferItemType($normalized, $item),
                'title' => data_get($normalized, 'title', $item->title),
                'normalized_title' => Str::of((string) data_get($normalized, 'title', $item->title))->lower()->squish()->toString(),
                'description' => data_get($normalized, 'description', $item->description),
                'thumbnail_url' => data_get($normalized, 'coverImageUrl', $item->thumbnail_url),
                'canonical_url' => data_get($normalized, 'source.url', $item->canonical_url),
                'canonical_url_hash' => data_get($normalized, 'source.url') ? hash('sha256', (string) data_get($normalized, 'source.url')) : $item->canonical_url_hash,
                'status' => $hasContent ? 'ready' : 'failed',
                'audio_count' => count($episodes),
                'metadata' => [
                    'validation' => $validation,
                    'warnings' => data_get($normalized, 'warnings', []),
                    'source' => data_get($normalized, 'source'),
                    'item_type' => $this->inferItemType($normalized, $item),
                    'category' => data_get($normalized, 'category'),
                    'authors' => data_get($normalized, 'authors', []),
                    'narrator' => data_get($normalized, 'narrator'),
                ],
                'error_message' => $hasContent ? null : 'Crawler completed without usable content.',
                'crawl_count' => ($item->crawl_count ?? 0) + 1,
                'failure_count' => $hasContent ? $item->failure_count : ($item->failure_count ?? 0) + 1,
                'last_crawled_at' => $now,
                'last_changed_at' => $now,
            ])->save();

            $this->storeItemAudios($item, $run, $episodes);
            $this->storeItemAssets($item, $run, $assets);
        }

        $run->forceFill([
            'status' => $hasContent ? 'completed' : 'failed',
            'processed_count' => 1,
            'created_count' => $item ? CrawlerItemAsset::query()->where('crawler_item_id', $item->id)->count() : 0,
            'failed_count' => $hasContent ? 0 : 1,
            'options' => array_merge($run->options ?? [], [
                'remote_job' => $result['job'] ?? $remoteJob,
                'validation' => $validation,
            ]),
            'error_message' => $hasContent ? null : 'Crawler completed without usable content.',
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

    /**
     * @param array<string, mixed> $normalized
     * @return array<int, array<string, mixed>>
     */
    private function extractAssets(array $normalized): array
    {
        $assets = [];

        foreach ((array) ($normalized['episodes'] ?? []) as $index => $episode) {
            if (! is_array($episode) || ! is_string($episode['audioUrl'] ?? null) || $episode['audioUrl'] === '') {
                continue;
            }

            $assets[] = [
                'asset_type' => 'audio',
                'external_id' => $episode['externalId'] ?? null,
                'title' => $episode['title'] ?? 'Episode ' . ($index + 1),
                'position' => $episode['position'] ?? ($index + 1),
                'url' => $episode['audioUrl'],
                'duration_seconds' => $episode['durationSeconds'] ?? null,
                'metadata' => [
                    'description' => $episode['description'] ?? null,
                ],
            ];
        }

        foreach (['assets', 'images', 'videos', 'documents', 'attachments'] as $key) {
            foreach ((array) ($normalized[$key] ?? []) as $index => $asset) {
                if (! is_array($asset)) {
                    continue;
                }

                $url = $asset['url'] ?? $asset['src'] ?? $asset['href'] ?? null;

                if (! is_string($url) || $url === '') {
                    continue;
                }

                $assets[] = [
                    'asset_type' => $this->assetTypeFromKey($key, $asset),
                    'external_id' => $asset['externalId'] ?? $asset['id'] ?? null,
                    'title' => $asset['title'] ?? $asset['alt'] ?? null,
                    'position' => $asset['position'] ?? ($index + 1),
                    'url' => $url,
                    'mime_type' => $asset['mimeType'] ?? $asset['contentType'] ?? null,
                    'duration_seconds' => $asset['durationSeconds'] ?? null,
                    'content_length' => $asset['contentLength'] ?? null,
                    'metadata' => $asset,
                ];
            }
        }

        return $assets;
    }

    /**
     * @param array<string, mixed> $normalized
     * @param array<int, mixed> $episodes
     * @param array<int, mixed> $assets
     */
    private function hasNormalizedContent(array $normalized, array $episodes, array $assets): bool
    {
        return ! empty($episodes)
            || ! empty($assets)
            || filled($normalized['title'] ?? null)
            || filled($normalized['description'] ?? null)
            || filled($normalized['content'] ?? null)
            || filled($normalized['body'] ?? null);
    }

    /**
     * @param array<string, mixed> $normalized
     */
    private function inferItemType(array $normalized, CrawlerItem $item): string
    {
        $explicit = $normalized['itemType'] ?? $normalized['entityType'] ?? $normalized['type'] ?? null;

        if (is_string($explicit) && $explicit !== '') {
            return Str::of($explicit)->lower()->replace('-', '_')->toString();
        }

        if (! empty($normalized['episodes'])) {
            return 'podcast';
        }

        if (! empty($normalized['videos'])) {
            return 'video';
        }

        if (! empty($normalized['documents'])) {
            return 'document';
        }

        if (filled($normalized['content'] ?? null) || filled($normalized['body'] ?? null)) {
            return 'article';
        }

        return $item->item_type ?: 'unknown';
    }

    /**
     * @param array<string, mixed> $asset
     */
    private function assetTypeFromKey(string $key, array $asset): string
    {
        if (is_string($asset['assetType'] ?? null) && $asset['assetType'] !== '') {
            return (string) $asset['assetType'];
        }

        return match ($key) {
            'images' => 'image',
            'videos' => 'video',
            'documents' => 'document',
            default => 'attachment',
        };
    }

    /**
     * @param array<int, array<string, mixed>> $assets
     */
    private function storeItemAssets(CrawlerItem $item, CrawlerRun $run, array $assets): void
    {
        foreach ($assets as $asset) {
            $url = $asset['url'] ?? null;

            if (! is_string($url) || $url === '') {
                continue;
            }

            CrawlerItemAsset::query()->updateOrCreate(
                [
                    'crawler_item_id' => $item->id,
                    'url_hash' => hash('sha256', $url),
                ],
                [
                    'last_crawler_run_id' => $run->id,
                    'asset_type' => $asset['asset_type'] ?? 'attachment',
                    'external_id' => $asset['external_id'] ?? null,
                    'title' => $asset['title'] ?? null,
                    'position' => $asset['position'] ?? null,
                    'url' => $url,
                    'mime_type' => $asset['mime_type'] ?? null,
                    'duration_seconds' => $asset['duration_seconds'] ?? null,
                    'content_length' => $asset['content_length'] ?? null,
                    'status' => 'active',
                    'metadata' => $asset['metadata'] ?? [],
                    'error_message' => null,
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
