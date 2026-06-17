<?php

namespace Frieren\Crawler\Http\Controllers;

use App\Models\Episode;
use App\Models\Podcast;
use Frieren\Crawler\Jobs\SyncCrawlerResult;
use Frieren\Crawler\Models\CrawlerItem;
use Frieren\Crawler\Models\CrawlerItemAudio;
use Frieren\Crawler\Models\CrawlerProfile;
use Frieren\Crawler\Models\CrawlerRun;
use Frieren\Crawler\Models\CrawlerSource;
use Frieren\Crawler\Services\AudioUrlInspector;
use Frieren\Crawler\Services\PodcastAudioCrawler;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

final class AdminCrawlerController
{
    public function overview(): JsonResponse
    {
        return response()->json([
            'data' => [
                'enabled' => (bool) config('frieren-crawler.enabled'),
                'service' => [
                    'base_url' => config('frieren-crawler.service.base_url'),
                    'health_path' => config('frieren-crawler.service.health_path'),
                    'dispatch_path' => config('frieren-crawler.service.dispatch_path'),
                ],
                'rabbitmq' => [
                    'host' => config('frieren-crawler.rabbitmq.host'),
                    'port' => config('frieren-crawler.rabbitmq.port'),
                    'management_url' => config('frieren-crawler.rabbitmq.management_url'),
                ],
                'metrics' => [
                    'profiles' => CrawlerProfile::query()->count(),
                    'sources' => CrawlerSource::query()->count(),
                    'active_sources' => CrawlerSource::query()->where('status', 'active')->count(),
                    'runs' => CrawlerRun::query()->count(),
                    'running_runs' => CrawlerRun::query()->whereIn('status', ['pending', 'running'])->count(),
                    'failed_runs' => CrawlerRun::query()->where('status', 'failed')->count(),
                    'items' => CrawlerItem::query()->count(),
                    'ready_items' => CrawlerItem::query()->where('status', 'ready')->count(),
                    'item_audios' => CrawlerItemAudio::query()->count(),
                    'active_item_audios' => CrawlerItemAudio::query()->where('status', 'active')->count(),
                ],
            ],
        ]);
    }

    public function health(): JsonResponse
    {
        $url = $this->crawlerUrl((string) config('frieren-crawler.service.health_path'));

        try {
            $response = $this->crawlerHttp()->get($url);

            return response()->json([
                'data' => [
                    'ok' => $response->successful(),
                    'status' => $response->status(),
                    'body' => $response->json() ?? $response->body(),
                ],
            ]);
        } catch (\Throwable $exception) {
            return response()->json([
                'data' => [
                    'ok' => false,
                    'status' => null,
                    'body' => $exception->getMessage(),
                ],
            ], 502);
        }
    }

    public function sources(Request $request): JsonResponse
    {
        $sources = CrawlerSource::query()
            ->with('profile:id,name,key,driver,version')
            ->when($request->string('search')->isNotEmpty(), function ($query) use ($request): void {
                $search = '%' . $request->string('search')->toString() . '%';
                $query->where(function ($query) use ($search): void {
                    $query->where('name', 'like', $search)
                        ->orWhere('base_url', 'like', $search)
                        ->orWhere('host', 'like', $search);
                });
            })
            ->when($request->string('status')->isNotEmpty(), fn ($query) => $query->where('status', $request->string('status')->toString()))
            ->latest()
            ->paginate((int) $request->integer('per_page', 10));

        return response()->json($sources);
    }

    public function storeSource(Request $request): JsonResponse
    {
        $data = $this->validatedSourceData($request);
        $source = CrawlerSource::query()->create($data);
        $this->syncSourceStartItems($source);

        return response()->json(['data' => $source], 201);
    }

    public function updateSource(Request $request, CrawlerSource $crawlerSource): JsonResponse
    {
        $data = $this->validatedSourceData($request);
        $crawlerSource->update($data);
        $this->syncSourceStartItems($crawlerSource->refresh());

        return response()->json(['data' => $crawlerSource->refresh()]);
    }

    public function destroySource(CrawlerSource $crawlerSource): JsonResponse
    {
        $crawlerSource->delete();

        return response()->json(status: 204);
    }

    public function jobs(Request $request): JsonResponse
    {
        $jobs = CrawlerRun::query()
            ->with('source:id,name,type,base_url,host', 'items:id,last_crawler_run_id,title,source_url,status,audio_count')
            ->when($request->string('search')->isNotEmpty(), function ($query) use ($request): void {
                $search = '%' . $request->string('search')->toString() . '%';
                $query->where(function ($query) use ($search): void {
                    $query->whereHas('source', function ($sourceQuery) use ($search): void {
                        $sourceQuery->where('name', 'like', $search)->orWhere('base_url', 'like', $search);
                    })->orWhere('cursor->external_job_id', 'like', $search);
                });
            })
            ->when($request->string('status')->isNotEmpty(), fn ($query) => $query->where('status', $request->string('status')->toString()))
            ->latest()
            ->paginate((int) $request->integer('per_page', 10));

        return response()->json($jobs);
    }

    public function items(Request $request): JsonResponse
    {
        $items = CrawlerItem::query()
            ->with(['source:id,name,type,base_url,host', 'podcast:id,title'])
            ->withCount('audios')
            ->when($request->integer('source_id') ?: $request->input('filter.source_id'), fn ($query, $sourceId) => $query->where('crawler_source_id', $sourceId))
            ->when($request->string('status')->isNotEmpty(), fn ($query) => $query->where('status', $request->string('status')->toString()))
            ->when($request->input('filter.status'), function ($query, $status): void {
                $statuses = is_array($status) ? $status : explode(',', (string) $status);
                $query->whereIn('status', array_filter($statuses));
            })
            ->when($request->string('search')->isNotEmpty() || $request->input('filter.all'), function ($query) use ($request): void {
                $search = '%' . ($request->string('search')->toString() ?: (string) $request->input('filter.all')) . '%';
                $query->where(function ($query) use ($search): void {
                    $query->where('title', 'like', $search)
                        ->orWhere('source_url', 'like', $search)
                        ->orWhere('canonical_url', 'like', $search);
                });
            })
            ->when($request->input('filter.created_from'), fn ($query, $value) => $query->whereDate('created_at', '>=', $value))
            ->when($request->input('filter.created_to'), fn ($query, $value) => $query->whereDate('created_at', '<=', $value))
            ->when($request->string('sort')->isNotEmpty(), function ($query) use ($request): void {
                $sort = $request->string('sort')->toString();
                $direction = Str::startsWith($sort, '-') ? 'desc' : 'asc';
                $column = ltrim($sort, '-');
                $allowed = ['id', 'title', 'status', 'audio_count', 'last_crawled_at', 'created_at'];

                if (in_array($column, $allowed, true)) {
                    $query->orderBy($column, $direction);
                }
            }, fn ($query) => $query->latest())
            ->paginate((int) $request->integer('per_page', 10));

        return response()->json($items);
    }

    public function showItem(CrawlerItem $crawlerItem): JsonResponse
    {
        return response()->json([
            'data' => $crawlerItem->loadCount('audios')->load([
                'source:id,name,type,base_url,host,status,last_crawled_at',
                'lastRun',
                'podcast:id,title,slug',
            ]),
        ]);
    }

    public function storeItem(Request $request): JsonResponse
    {
        $data = $this->validatedItemData($request);
        $item = CrawlerItem::query()->create($data);

        return response()->json([
            'data' => $item->load(['source:id,name,type,base_url,host', 'podcast:id,title'])->loadCount('audios'),
        ], 201);
    }

    public function updateItem(Request $request, CrawlerItem $crawlerItem): JsonResponse
    {
        $data = $this->validatedItemData($request, $crawlerItem);
        $crawlerItem->update($data);

        return response()->json([
            'data' => $crawlerItem->refresh()->load(['source:id,name,type,base_url,host', 'podcast:id,title'])->loadCount('audios'),
        ]);
    }

    public function destroyItem(CrawlerItem $crawlerItem): JsonResponse
    {
        $crawlerItem->delete();

        return response()->json(status: 204);
    }

    public function itemAudios(Request $request, CrawlerItem $crawlerItem): JsonResponse
    {
        $audios = $crawlerItem->audios()
            ->with('episode:id,title,slug')
            ->when($request->string('search')->isNotEmpty() || $request->input('filter.all'), function ($query) use ($request): void {
                $search = '%' . ($request->string('search')->toString() ?: (string) $request->input('filter.all')) . '%';
                $query->where(function ($query) use ($search): void {
                    $query->where('title', 'like', $search)
                        ->orWhere('audio_url', 'like', $search)
                        ->orWhere('content_type', 'like', $search);
                });
            })
            ->when($request->input('filter.status'), function ($query, $status): void {
                $statuses = is_array($status) ? $status : explode(',', (string) $status);
                $query->whereIn('status', array_filter($statuses));
            })
            ->when($request->string('sort')->isNotEmpty(), function ($query) use ($request): void {
                $sort = $request->string('sort')->toString();
                $direction = Str::startsWith($sort, '-') ? 'desc' : 'asc';
                $column = ltrim($sort, '-');
                $allowed = ['id', 'title', 'position', 'status', 'duration_seconds', 'last_crawled_at', 'created_at'];

                if (in_array($column, $allowed, true)) {
                    $query->orderBy($column, $direction);
                }
            }, fn ($query) => $query->orderBy('position')->orderBy('id'))
            ->paginate((int) $request->integer('per_page', 10));

        return response()->json($audios);
    }

    public function crawlItems(Request $request): JsonResponse
    {
        $data = $request->validate([
            'source_id' => ['required', 'integer', 'exists:crawler_sources,id'],
            'count' => ['required', 'integer', 'min:1', 'max:100'],
            'selection' => ['nullable', Rule::in(['pending', 'failed', 'oldest', 'all'])],
        ]);

        $query = CrawlerItem::query()
            ->where('crawler_source_id', $data['source_id'])
            ->when(($data['selection'] ?? 'pending') === 'pending', fn ($query) => $query->whereIn('status', ['pending', 'discovered', 'failed']))
            ->when(($data['selection'] ?? 'pending') === 'failed', fn ($query) => $query->where('status', 'failed'))
            ->when(($data['selection'] ?? 'pending') === 'oldest', fn ($query) => $query->orderByRaw('last_crawled_at is null desc')->oldest('last_crawled_at'))
            ->when(($data['selection'] ?? 'pending') !== 'oldest', fn ($query) => $query->oldest('last_crawled_at'))
            ->limit((int) $data['count']);

        $items = $query->get();
        $dispatched = 0;

        foreach ($items as $item) {
            if ($this->dispatchItemCrawl($item)) {
                $dispatched++;
            }
        }

        return response()->json([
            'data' => [
                'requested_count' => (int) $data['count'],
                'selected_count' => $items->count(),
                'dispatched_count' => $dispatched,
            ],
        ], 202);
    }

    public function crawlItem(CrawlerItem $crawlerItem): JsonResponse
    {
        $dispatched = $this->dispatchItemCrawl($crawlerItem);

        return response()->json([
            'data' => [
                'item' => $crawlerItem->refresh()->load('source:id,name,type,base_url,host'),
                'dispatched' => $dispatched,
            ],
        ], $dispatched ? 202 : 502);
    }

    public function dispatch(Request $request): JsonResponse
    {
        $data = $request->validate([
            'source_id' => ['nullable', 'integer', 'exists:crawler_sources,id'],
            'target_url' => ['required_without:source_id', 'nullable', 'url', 'max:2048'],
            'type' => ['nullable', 'string', 'max:120'],
            'connector' => ['nullable', 'string', 'max:120'],
            'options' => ['nullable', 'array'],
            'selectors' => ['nullable', 'array'],
        ]);

        $source = isset($data['source_id']) ? CrawlerSource::query()->find($data['source_id']) : null;
        $targetUrl = $data['target_url'] ?? $source?->base_url;

        if (! $source && $targetUrl) {
            $source = $this->sourceForUrl($targetUrl, $data['type'] ?? null);
        }

        $type = $data['type'] ?? $source?->type ?? 'generic';
        $connector = $data['connector'] ?? $source?->type ?? $type;
        $connector = $this->inferConnector($targetUrl, $connector);
        $options = $data['options'] ?? $source?->options_override ?? [];
        $selectors = $data['selectors'] ?? $source?->profile?->selectors ?? [];
        $item = $this->firstOrCreateCrawlerItem($source, (string) $targetUrl);
        $run = CrawlerRun::query()->create([
            'crawler_source_id' => $source->id,
            'crawler_profile_id' => $source->crawler_profile_id,
            'mode' => 'crawl',
            'selection' => 'selected',
            'requested_count' => 1,
            'status' => 'pending',
            'profile_snapshot' => $source->profile ? $source->profile->only(['id', 'name', 'key', 'driver', 'version', 'selectors', 'options']) : null,
            'options' => [
                'target_url' => $targetUrl,
                'connector' => $connector,
                'selectors' => $selectors,
                'options' => $options,
            ],
            'cursor' => [
                'crawler_item_id' => $item->id,
            ],
        ]);

        $payload = [
            'source_id' => $source?->id,
            'run_id' => $run->id,
            'item_id' => $item->id,
            'type' => $type,
            'connector' => $connector,
            'url' => $targetUrl,
            'options' => $options,
            'selectors' => $selectors,
        ];
        $crawlerPayload = [
            'url' => $targetUrl,
            'entityType' => $type,
            'connector' => $connector,
            'options' => $options,
            'selectors' => $selectors,
            'runImmediately' => false,
            'runInBackground' => true,
        ];

        try {
            $response = $this->crawlerHttp()->post($this->crawlerUrl((string) config('frieren-crawler.service.dispatch_path')), $crawlerPayload);
            $body = $response->json();
            $resolvedConnector = data_get($body, 'job.connector') ?? data_get($body, 'connector') ?? data_get($body, 'connector');
            $hasConnectorMismatch = $response->successful()
                && $connector !== 'generic'
                && $resolvedConnector !== null
                && $resolvedConnector !== $connector;

            $externalJobId = data_get($body, 'job.id') ?? data_get($body, 'id') ?? data_get($body, 'job_id') ?? data_get($body, 'data.id');
            $run->update([
                'status' => $response->successful() && ! $hasConnectorMismatch ? 'dispatched' : 'failed',
                'cursor' => array_merge($run->cursor ?? [], [
                    'external_job_id' => $externalJobId,
                    'payload' => $payload,
                    'response' => $this->summarizeCrawlerResponse($body ?? ['body' => $response->body()]),
                ]),
                'error_message' => $hasConnectorMismatch
                    ? "Crawler service resolved connector [{$resolvedConnector}] instead of expected [{$connector}]. Rebuild/restart frieren-crawler."
                    : ($response->successful() ? null : $response->body()),
                'started_at' => now(),
            ]);

            $item->update([
                'last_crawler_run_id' => $run->id,
                'status' => $run->status === 'failed' ? 'failed' : 'processing',
                'error_message' => $run->status === 'failed' ? $run->error_message : null,
            ]);

            if ($run->status === 'dispatched' && $externalJobId) {
                SyncCrawlerResult::dispatch($run->id)->delay(now()->addSeconds(5));
            }
        } catch (\Throwable $exception) {
            $run->update([
                'status' => 'failed',
                'error_message' => $exception->getMessage(),
                'finished_at' => now(),
            ]);
            $item->update([
                'status' => 'failed',
                'error_message' => $exception->getMessage(),
            ]);
        }

        return response()->json([
            'data' => $run->refresh()->load('source:id,name,type,base_url,host', 'items'),
        ], $run->status === 'failed' ? 502 : 201);
    }

    public function audioCandidates(Request $request): JsonResponse
    {
        $candidates = CrawlerItemAudio::query()
            ->with(['item:id,title,podcast_id,source_url', 'item.podcast:id,title', 'episode:id,title'])
            ->when($request->integer('podcast_id'), function ($query, $podcastId): void {
                $query->whereHas('item', fn ($itemQuery) => $itemQuery->where('podcast_id', $podcastId));
            })
            ->when($request->string('status')->isNotEmpty(), fn ($query) => $query->where('status', $request->string('status')->toString()))
            ->when($request->string('search')->isNotEmpty(), function ($query) use ($request): void {
                $search = '%' . $request->string('search')->toString() . '%';
                $query->where(function ($query) use ($search): void {
                    $query->where('title', 'like', $search)->orWhere('audio_url', 'like', $search);
                });
            })
            ->latest()
            ->paginate((int) $request->integer('per_page', 20));

        return response()->json($candidates);
    }

    public function collectPodcastAudio(Request $request, PodcastAudioCrawler $crawler, AudioUrlInspector $inspector): JsonResponse
    {
        $data = $request->validate([
            'podcast_id' => ['required', 'integer', 'exists:podcasts,id'],
            'source_id' => ['nullable', 'integer', 'exists:crawler_sources,id'],
            'source_url' => ['nullable', 'url', 'max:2048'],
            'raw_urls' => ['nullable'],
            'title_prefix' => ['nullable', 'string', 'max:255'],
            'validate' => ['sometimes', 'boolean'],
        ]);

        $podcast = Podcast::query()->findOrFail($data['podcast_id']);
        $source = isset($data['source_id']) ? CrawlerSource::query()->find($data['source_id']) : null;
        $sourceUrl = $data['source_url'] ?? $source?->base_url;
        $source = $source ?? ($sourceUrl ? $this->sourceForUrl($sourceUrl, null) : null);
        $urls = $crawler->normalizeRawUrls($data['raw_urls'] ?? null);

        if ($sourceUrl) {
            $urls = array_values(array_unique(array_merge($urls, $crawler->collectFromUrl($sourceUrl))));
        }

        $item = $this->firstOrCreateCrawlerItem($source, $sourceUrl ?? 'manual-audio-url-list');
        $run = CrawlerRun::query()->create([
            'crawler_source_id' => $source->id,
            'crawler_profile_id' => $source->crawler_profile_id,
            'mode' => 'crawl',
            'selection' => 'selected',
            'requested_count' => 1,
            'processed_count' => 1,
            'created_count' => count($urls),
            'status' => 'completed',
            'options' => [
                'strategy' => 'podcast_audio',
                'podcast_id' => $podcast->id,
                'source_url' => $sourceUrl,
                'raw_urls_count' => count($crawler->normalizeRawUrls($data['raw_urls'] ?? null)),
            ],
            'finished_at' => now(),
        ]);

        $created = [];

        foreach ($urls as $index => $url) {
            $title = ($data['title_prefix'] ?? null)
                ? trim($data['title_prefix']) . ' ' . ($index + 1)
                : $crawler->titleFromUrl($url, "Episode " . ($index + 1));
            $inspection = ($data['validate'] ?? true) ? $inspector->inspect($url) : ['status' => 'pending'];

            $created[] = CrawlerItemAudio::query()->updateOrCreate(
                ['crawler_item_id' => $item->id, 'audio_url_hash' => hash('sha256', $url)],
                [
                    'last_crawler_run_id' => $run->id,
                    'title' => $title,
                    'position' => $index + 1,
                    'audio_url' => $url,
                    'status' => ($inspection['status'] ?? 'pending') === 'valid' ? 'active' : ($inspection['status'] ?? 'pending'),
                    'http_status' => $inspection['http_status'] ?? null,
                    'content_type' => $inspection['content_type'] ?? null,
                    'content_length' => $inspection['content_length'] ?? null,
                    'duration_seconds' => $inspection['duration_seconds'] ?? null,
                    'error_message' => $inspection['error_message'] ?? null,
                    'metadata' => $inspection['metadata'] ?? [],
                    'first_discovered_at' => now(),
                    'last_crawled_at' => now(),
                    'last_changed_at' => now(),
                ]
            );
        }

        $item->update([
            'podcast_id' => $podcast->id,
            'last_crawler_run_id' => $run->id,
            'status' => 'ready',
            'audio_count' => count($created),
            'last_crawled_at' => now(),
        ]);

        return response()->json([
            'data' => [
                'run' => $run,
                'item' => $item->refresh(),
                'total_urls' => count($urls),
                'stored_candidates' => count($created),
                'valid_candidates' => collect($created)->whereIn('status', ['active', 'valid'])->count(),
            ],
        ], 201);
    }

    public function importPodcastAudio(Request $request): JsonResponse
    {
        $data = $request->validate([
            'podcast_id' => ['required', 'integer', 'exists:podcasts,id'],
            'candidate_ids' => ['nullable', 'array'],
            'candidate_ids.*' => ['integer', 'exists:crawler_item_audios,id'],
            'import_all_valid' => ['sometimes', 'boolean'],
            'description' => ['nullable', 'string'],
        ]);

        $query = CrawlerItemAudio::query()
            ->whereHas('item', fn ($itemQuery) => $itemQuery->where('podcast_id', $data['podcast_id']))
            ->whereIn('status', ['active', 'valid'])
            ->whereNull('episode_id');

        if (! ($data['import_all_valid'] ?? false)) {
            $query->whereIn('id', $data['candidate_ids'] ?? []);
        }

        $candidates = $query->get();
        $imported = 0;

        DB::transaction(function () use ($candidates, $data, &$imported): void {
            foreach ($candidates as $candidate) {
                if (Episode::query()->where('podcast_id', $data['podcast_id'])->where('audio_path', $candidate->audio_url)->exists()) {
                    $candidate->update(['status' => 'duplicate']);
                    continue;
                }

                $episode = Episode::query()->create([
                    'podcast_id' => $data['podcast_id'],
                    'title' => $this->uniqueEpisodeTitle($candidate->title ?: 'Untitled episode'),
                    'slug' => $this->uniqueEpisodeSlug(Str::slug($candidate->title ?: 'untitled-episode')),
                    'description' => $data['description'] ?? null,
                    'audio_path' => $candidate->audio_url,
                    'duration' => $candidate->duration_seconds,
                    'published_at' => now(),
                ]);

                $candidate->update([
                    'episode_id' => $episode->id,
                    'status' => 'imported',
                    'imported_at' => now(),
                ]);

                $imported++;
            }
        });

        return response()->json([
            'data' => [
                'selected_candidates' => $candidates->count(),
                'imported_episodes' => $imported,
            ],
        ]);
    }

    public function checkPodcastLinks(Request $request, Podcast $podcast, AudioUrlInspector $inspector): JsonResponse
    {
        $episodes = $podcast->episodes()->whereNotNull('audio_path')->get();
        $checks = [];

        foreach ($episodes as $episode) {
            $inspection = $inspector->inspect($episode->audio_url ?? $episode->audio_path);
            $source = $this->sourceForUrl((string) ($episode->audio_url ?? $episode->audio_path), 'manual');
            $item = CrawlerItem::query()->firstOrCreate(
                [
                    'crawler_source_id' => $source->id,
                    'source_url_hash' => hash('sha256', (string) ($episode->audio_url ?? $episode->audio_path)),
                ],
                [
                    'podcast_id' => $podcast->id,
                    'title' => $podcast->title,
                    'normalized_title' => Str::lower($podcast->title),
                    'source_url' => (string) ($episode->audio_url ?? $episode->audio_path),
                    'status' => 'ready',
                    'first_discovered_at' => now(),
                ],
            );

            $checks[] = CrawlerItemAudio::query()->updateOrCreate([
                'crawler_item_id' => $item->id,
                'audio_url_hash' => hash('sha256', (string) ($episode->audio_url ?? $episode->audio_path)),
            ], [
                'episode_id' => $episode->id,
                'title' => $episode->title,
                'audio_url' => $episode->audio_url ?? $episode->audio_path,
                'status' => ($inspection['status'] ?? 'invalid') === 'valid' ? 'active' : ($inspection['status'] ?? 'invalid'),
                'http_status' => $inspection['http_status'],
                'content_type' => $inspection['content_type'],
                'content_length' => $inspection['content_length'],
                'error_message' => $inspection['error_message'],
                'metadata' => $inspection['metadata'],
                'last_crawled_at' => now(),
            ]);
        }

        return response()->json([
            'data' => [
                'podcast_id' => $podcast->id,
                'checked' => count($checks),
                'valid' => collect($checks)->whereIn('status', ['active', 'valid'])->count(),
                'invalid' => collect($checks)->where('status', 'invalid')->count(),
            ],
        ]);
    }

    public function linkChecks(Request $request): JsonResponse
    {
        $checks = CrawlerItemAudio::query()
            ->with(['item:id,title,podcast_id,source_url', 'item.podcast:id,title', 'episode:id,title'])
            ->when($request->integer('podcast_id'), function ($query, $podcastId): void {
                $query->whereHas('item', fn ($itemQuery) => $itemQuery->where('podcast_id', $podcastId));
            })
            ->when($request->string('status')->isNotEmpty(), fn ($query) => $query->where('status', $request->string('status')->toString()))
            ->latest('last_crawled_at')
            ->paginate((int) $request->integer('per_page', 20));

        return response()->json($checks);
    }

    private function validatedSourceData(Request $request): array
    {
        $data = $request->validate([
            'crawler_profile_id' => ['nullable', 'integer', 'exists:crawler_profiles,id'],
            'name' => ['required', 'string', 'max:255'],
            'type' => ['required', 'string', 'max:120'],
            'url' => ['required_without:base_url', 'nullable', 'url', 'max:2048'],
            'base_url' => ['required_without:url', 'nullable', 'url', 'max:2048'],
            'host' => ['nullable', 'string', 'max:255'],
            'status' => ['required', Rule::in(['active', 'paused'])],
            'options_override' => ['nullable', 'array'],
            'start_urls' => ['nullable', 'array'],
            'selectors' => ['nullable', 'array'],
            'options' => ['nullable', 'array'],
        ]);

        $baseUrl = $data['base_url'] ?? $data['url'];
        $host = $data['host'] ?? parse_url((string) $baseUrl, PHP_URL_HOST);

        return [
            'crawler_profile_id' => $data['crawler_profile_id'] ?? null,
            'name' => $data['name'],
            'type' => $this->inferConnector($baseUrl, $data['type']),
            'base_url' => $baseUrl,
            'host' => Str::lower((string) $host),
            'status' => $data['status'],
            'options_override' => $data['options_override'] ?? $data['options'] ?? null,
            'start_urls' => $data['start_urls'] ?? null,
        ];
    }

    private function validatedItemData(Request $request, ?CrawlerItem $item = null): array
    {
        $data = $request->validate([
            'crawler_source_id' => ['required', 'integer', 'exists:crawler_sources,id'],
            'podcast_id' => ['nullable', 'integer', 'exists:podcasts,id'],
            'external_id' => ['nullable', 'string', 'max:255'],
            'title' => ['nullable', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255'],
            'source_url' => ['required', 'url', 'max:2048'],
            'canonical_url' => ['nullable', 'url', 'max:2048'],
            'description' => ['nullable', 'string'],
            'thumbnail_url' => ['nullable', 'url', 'max:2048'],
            'status' => ['required', Rule::in(['discovered', 'pending', 'processing', 'ready', 'imported', 'duplicate', 'skipped', 'failed'])],
            'metadata' => ['nullable', 'array'],
            'error_message' => ['nullable', 'string'],
        ]);

        return [
            ...$data,
            'normalized_title' => isset($data['title']) ? Str::of((string) $data['title'])->lower()->squish()->toString() : null,
            'source_url_hash' => hash('sha256', $data['source_url']),
            'canonical_url_hash' => isset($data['canonical_url']) ? hash('sha256', $data['canonical_url']) : null,
            'first_discovered_at' => $item?->first_discovered_at ?? now(),
        ];
    }

    private function crawlerHttp(): \Illuminate\Http\Client\PendingRequest
    {
        $request = Http::timeout((int) config('frieren-crawler.service.timeout'));
        $token = config('frieren-crawler.service.token');

        return $token ? $request->withToken((string) $token) : $request;
    }

    private function crawlerUrl(string $path): string
    {
        return rtrim((string) config('frieren-crawler.service.base_url'), '/') . '/' . ltrim($path, '/');
    }

    private function inferConnector(?string $targetUrl, string $connector): string
    {
        if ($connector !== 'generic' || $targetUrl === null) {
            return $connector;
        }

        $host = parse_url($targetUrl, PHP_URL_HOST);

        return match (true) {
            $host === 'radiosach.com' || Str::endsWith((string) $host, '.radiosach.com') => 'radiosach',
            $host === 'phatphapungdung.com' || Str::endsWith((string) $host, '.phatphapungdung.com') => 'phatphapungdung',
            default => $connector,
        };
    }

    private function sourceForUrl(string $url, ?string $type): CrawlerSource
    {
        $host = parse_url($url, PHP_URL_HOST) ?: 'manual.local';
        $connector = $this->inferConnector($url, $type ?: 'generic');

        return CrawlerSource::query()->firstOrCreate(
            ['host' => Str::lower((string) $host)],
            [
                'name' => Str::headline(str_replace('.', ' ', (string) $host)),
                'type' => $connector,
                'base_url' => $url,
                'status' => 'active',
                'start_urls' => [$url],
            ],
        );
    }

    private function firstOrCreateCrawlerItem(CrawlerSource $source, string $url): CrawlerItem
    {
        return CrawlerItem::query()->firstOrCreate(
            [
                'crawler_source_id' => $source->id,
                'source_url_hash' => hash('sha256', $url),
            ],
            [
                'source_url' => $url,
                'status' => 'pending',
                'first_discovered_at' => now(),
            ],
        );
    }

    private function syncSourceStartItems(CrawlerSource $source): void
    {
        $urls = array_values(array_filter(array_unique(array_merge(
            [$source->base_url],
            is_array($source->start_urls) ? $source->start_urls : [],
        ))));

        foreach ($urls as $url) {
            if (is_string($url) && $url !== '') {
                $this->firstOrCreateCrawlerItem($source, $url);
            }
        }
    }

    private function dispatchItemCrawl(CrawlerItem $item): bool
    {
        $source = $item->source()->with('profile')->first();

        if (! $source) {
            return false;
        }

        $connector = $this->inferConnector($item->source_url, $source->type);
        $selectors = $source->profile?->selectors ?? [];
        $options = $source->options_override ?? $source->profile?->options ?? [];
        $run = CrawlerRun::query()->create([
            'crawler_source_id' => $source->id,
            'crawler_profile_id' => $source->crawler_profile_id,
            'mode' => 'crawl',
            'selection' => 'selected',
            'requested_count' => 1,
            'status' => 'pending',
            'profile_snapshot' => $source->profile ? $source->profile->only(['id', 'name', 'key', 'driver', 'version', 'selectors', 'options']) : null,
            'options' => [
                'target_url' => $item->source_url,
                'connector' => $connector,
                'selectors' => $selectors,
                'options' => $options,
            ],
            'cursor' => [
                'crawler_item_id' => $item->id,
            ],
        ]);

        try {
            $response = $this->crawlerHttp()->post($this->crawlerUrl((string) config('frieren-crawler.service.dispatch_path')), [
                'url' => $item->source_url,
                'entityType' => $connector,
                'connector' => $connector,
                'options' => $options,
                'selectors' => $selectors,
                'runImmediately' => false,
                'runInBackground' => true,
            ]);
            $body = $response->json();
            $externalJobId = data_get($body, 'job.id') ?? data_get($body, 'id') ?? data_get($body, 'job_id') ?? data_get($body, 'data.id');

            $run->update([
                'status' => $response->successful() ? 'dispatched' : 'failed',
                'cursor' => array_merge($run->cursor ?? [], [
                    'external_job_id' => $externalJobId,
                    'response' => $this->summarizeCrawlerResponse($body ?? ['body' => $response->body()]),
                ]),
                'error_message' => $response->successful() ? null : $response->body(),
                'started_at' => now(),
            ]);

            $item->update([
                'last_crawler_run_id' => $run->id,
                'status' => $response->successful() ? 'processing' : 'failed',
                'error_message' => $response->successful() ? null : $response->body(),
            ]);

            if ($response->successful() && $externalJobId) {
                SyncCrawlerResult::dispatch($run->id)->delay(now()->addSeconds(5));

                return true;
            }
        } catch (\Throwable $exception) {
            $run->update([
                'status' => 'failed',
                'error_message' => $exception->getMessage(),
                'finished_at' => now(),
            ]);
            $item->update([
                'status' => 'failed',
                'error_message' => $exception->getMessage(),
            ]);
        }

        return false;
    }

    private function summarizeCrawlerResponse(array $body): array
    {
        return [
            'job' => data_get($body, 'job'),
            'validation' => data_get($body, 'validation'),
            'normalized' => [
                'title' => data_get($body, 'normalized.title'),
                'source' => data_get($body, 'normalized.source'),
                'episode_count' => count((array) data_get($body, 'normalized.episodes', [])),
                'warnings' => data_get($body, 'normalized.warnings', []),
            ],
        ];
    }

    private function uniqueEpisodeTitle(string $title): string
    {
        $candidate = $title;
        $index = 2;

        while (Episode::query()->where('title', $candidate)->exists()) {
            $candidate = "{$title} {$index}";
            $index++;
        }

        return $candidate;
    }

    private function uniqueEpisodeSlug(string $slug): string
    {
        $base = $slug ?: 'untitled-episode';
        $candidate = $base;
        $index = 2;

        while (Episode::query()->where('slug', $candidate)->exists()) {
            $candidate = "{$base}-{$index}";
            $index++;
        }

        return $candidate;
    }
}
