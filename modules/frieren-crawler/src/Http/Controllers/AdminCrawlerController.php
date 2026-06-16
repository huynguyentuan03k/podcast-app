<?php

namespace Frieren\Crawler\Http\Controllers;

use App\Models\Episode;
use App\Models\Podcast;
use Frieren\Crawler\Models\CrawlerAudioCandidate;
use Frieren\Crawler\Models\CrawlerJob;
use Frieren\Crawler\Models\CrawlerSource;
use Frieren\Crawler\Models\EpisodeLinkCheck;
use Frieren\Crawler\Services\AudioUrlInspector;
use Frieren\Crawler\Services\PodcastAudioCrawler;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Frieren\Crawler\Jobs\SyncCrawlerResult;

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
                    'sources' => CrawlerSource::query()->count(),
                    'active_sources' => CrawlerSource::query()->where('status', 'active')->count(),
                    'jobs' => CrawlerJob::query()->count(),
                    'queued_jobs' => CrawlerJob::query()->whereIn('status', ['draft', 'queued', 'dispatched'])->count(),
                    'failed_jobs' => CrawlerJob::query()->where('status', 'failed')->count(),
                    'audio_candidates' => CrawlerAudioCandidate::query()->count(),
                    'valid_audio_candidates' => CrawlerAudioCandidate::query()->where('status', 'valid')->count(),
                    'broken_episode_links' => EpisodeLinkCheck::query()->where('status', 'invalid')->count(),
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
            ->when($request->string('search')->isNotEmpty(), function ($query) use ($request): void {
                $search = '%' . $request->string('search')->toString() . '%';
                $query->where(function ($query) use ($search): void {
                    $query->where('name', 'like', $search)->orWhere('url', 'like', $search);
                });
            })
            ->when($request->string('status')->isNotEmpty(), fn ($query) => $query->where('status', $request->string('status')->toString()))
            ->latest()
            ->paginate((int) $request->integer('per_page', 10));

        return response()->json($sources);
    }

    public function storeSource(Request $request): JsonResponse
    {
        $data = $request->validate($this->sourceRules());
        $source = CrawlerSource::query()->create($data);

        return response()->json(['data' => $source], 201);
    }

    public function updateSource(Request $request, CrawlerSource $crawlerSource): JsonResponse
    {
        $data = $request->validate($this->sourceRules());
        $crawlerSource->update($data);

        return response()->json(['data' => $crawlerSource->refresh()]);
    }

    public function destroySource(CrawlerSource $crawlerSource): JsonResponse
    {
        $crawlerSource->delete();

        return response()->json(status: 204);
    }

    public function jobs(Request $request): JsonResponse
    {
        $jobs = CrawlerJob::query()
            ->with('source:id,name,type,url')
            ->when($request->string('search')->isNotEmpty(), function ($query) use ($request): void {
                $search = '%' . $request->string('search')->toString() . '%';
                $query->where(function ($query) use ($search): void {
                    $query->where('target_url', 'like', $search)->orWhere('external_job_id', 'like', $search);
                });
            })
            ->when($request->string('status')->isNotEmpty(), fn ($query) => $query->where('status', $request->string('status')->toString()))
            ->latest()
            ->paginate((int) $request->integer('per_page', 10));

        return response()->json($jobs);
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
        $targetUrl = $data['target_url'] ?? $source?->url;
        $type = $data['type'] ?? $source?->type ?? 'generic';
        $connector = $data['connector'] ?? $source?->type ?? $type;
        $connector = $this->inferConnector($targetUrl, $connector);
        $options = $data['options'] ?? $source?->options ?? [];
        $selectors = $data['selectors'] ?? $source?->selectors ?? [];

        $payload = [
            'source_id' => $source?->id,
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

        $job = CrawlerJob::query()->create([
            'crawler_source_id' => $source?->id,
            'target_url' => $targetUrl,
            'status' => 'queued',
            'payload' => $payload,
        ]);

        try {
            $response = $this->crawlerHttp()->post($this->crawlerUrl((string) config('frieren-crawler.service.dispatch_path')), $crawlerPayload);
            $body = $response->json();
            $resolvedConnector = data_get($body, 'job.connector') ?? data_get($body, 'connector');
            $hasConnectorMismatch = $response->successful()
                && $connector !== 'generic'
                && $resolvedConnector !== null
                && $resolvedConnector !== $connector;

            $job->update([
                'external_job_id' => data_get($body, 'job.id') ?? data_get($body, 'id') ?? data_get($body, 'job_id') ?? data_get($body, 'data.id'),
                'status' => $response->successful() && ! $hasConnectorMismatch ? 'dispatched' : 'failed',
                'response' => $this->summarizeCrawlerResponse($body ?? ['body' => $response->body()]),
                'error_message' => $hasConnectorMismatch
                    ? "Crawler service resolved connector [{$resolvedConnector}] instead of expected [{$connector}]. Rebuild/restart frieren-crawler."
                    : ($response->successful() ? null : $response->body()),
                'dispatched_at' => now(),
            ]);
                if ($job->status === 'dispatched' && $job->external_job_id) {
                    SyncCrawlerResult::dispatch($job->id)
                        ->delay(now()->addSeconds(5));
                }
        } catch (\Throwable $exception) {
            $job->update([
                'status' => 'failed',
                'error_message' => $exception->getMessage(),
                'dispatched_at' => now(),
            ]);
        }

        return response()->json(['data' => $job->refresh()->load('source')], $job->status === 'failed' ? 502 : 201);
    }

    public function audioCandidates(Request $request): JsonResponse
    {
        $candidates = CrawlerAudioCandidate::query()
            ->with(['podcast:id,title', 'episode:id,title'])
            ->when($request->integer('podcast_id'), fn ($query, $podcastId) => $query->where('podcast_id', $podcastId))
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
        $sourceUrl = $data['source_url'] ?? $source?->url;
        $urls = $crawler->normalizeRawUrls($data['raw_urls'] ?? null);

        if ($sourceUrl) {
            $urls = array_values(array_unique(array_merge($urls, $crawler->collectFromUrl($sourceUrl))));
        }

        $job = CrawlerJob::query()->create([
            'crawler_source_id' => $source?->id,
            'target_url' => $sourceUrl ?? 'manual-audio-url-list',
            'status' => 'completed',
            'payload' => [
                'strategy' => 'podcast_audio',
                'podcast_id' => $podcast->id,
                'source_url' => $sourceUrl,
                'raw_urls_count' => count($crawler->normalizeRawUrls($data['raw_urls'] ?? null)),
            ],
            'response' => ['collected_urls' => count($urls)],
            'finished_at' => now(),
        ]);

        $created = [];

        foreach ($urls as $index => $url) {
            $title = ($data['title_prefix'] ?? null)
                ? trim($data['title_prefix']) . ' ' . ($index + 1)
                : $crawler->titleFromUrl($url, "Episode " . ($index + 1));
            $inspection = ($data['validate'] ?? true) ? $inspector->inspect($url) : ['status' => 'pending'];

            $created[] = CrawlerAudioCandidate::query()->updateOrCreate(
                ['podcast_id' => $podcast->id, 'audio_url' => $url],
                [
                    'crawler_job_id' => $job->id,
                    'crawler_source_id' => $source?->id,
                    'title' => $title,
                    'slug' => Str::slug($title),
                    'status' => $inspection['status'] ?? 'pending',
                    'http_status' => $inspection['http_status'] ?? null,
                    'content_type' => $inspection['content_type'] ?? null,
                    'content_length' => $inspection['content_length'] ?? null,
                    'duration_seconds' => $inspection['duration_seconds'] ?? null,
                    'error_message' => $inspection['error_message'] ?? null,
                    'metadata' => $inspection['metadata'] ?? [],
                    'validated_at' => isset($inspection['status']) ? now() : null,
                ]
            );
        }

        return response()->json([
            'data' => [
                'job' => $job,
                'total_urls' => count($urls),
                'stored_candidates' => count($created),
                'valid_candidates' => collect($created)->where('status', 'valid')->count(),
            ],
        ], 201);
    }

    public function importPodcastAudio(Request $request): JsonResponse
    {
        $data = $request->validate([
            'podcast_id' => ['required', 'integer', 'exists:podcasts,id'],
            'candidate_ids' => ['nullable', 'array'],
            'candidate_ids.*' => ['integer', 'exists:crawler_audio_candidates,id'],
            'import_all_valid' => ['sometimes', 'boolean'],
            'description' => ['nullable', 'string'],
        ]);

        $query = CrawlerAudioCandidate::query()
            ->where('podcast_id', $data['podcast_id'])
            ->where('status', 'valid')
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
                    'slug' => $this->uniqueEpisodeSlug($candidate->slug ?: Str::slug($candidate->title ?: 'untitled-episode')),
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
            $checks[] = EpisodeLinkCheck::query()->create([
                'podcast_id' => $podcast->id,
                'episode_id' => $episode->id,
                'audio_url' => $episode->audio_url ?? $episode->audio_path,
                'status' => $inspection['status'],
                'http_status' => $inspection['http_status'],
                'content_type' => $inspection['content_type'],
                'content_length' => $inspection['content_length'],
                'error_message' => $inspection['error_message'],
                'metadata' => $inspection['metadata'],
                'checked_at' => now(),
            ]);
        }

        return response()->json([
            'data' => [
                'podcast_id' => $podcast->id,
                'checked' => count($checks),
                'valid' => collect($checks)->where('status', 'valid')->count(),
                'invalid' => collect($checks)->where('status', 'invalid')->count(),
            ],
        ]);
    }

    public function linkChecks(Request $request): JsonResponse
    {
        $checks = EpisodeLinkCheck::query()
            ->with(['podcast:id,title', 'episode:id,title'])
            ->when($request->integer('podcast_id'), fn ($query, $podcastId) => $query->where('podcast_id', $podcastId))
            ->when($request->string('status')->isNotEmpty(), fn ($query) => $query->where('status', $request->string('status')->toString()))
            ->latest('checked_at')
            ->paginate((int) $request->integer('per_page', 20));

        return response()->json($checks);
    }

    private function sourceRules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'type' => ['required', 'string', 'max:120'],
            'url' => ['required', 'url', 'max:2048'],
            'status' => ['required', Rule::in(['active', 'paused'])],
            'selectors' => ['nullable', 'array'],
            'options' => ['nullable', 'array'],
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
