<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Author;
use App\Models\Category;
use App\Models\Episode;
use App\Models\Podcast;
use App\Models\Publisher;
use App\Models\Tag;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;

class PortalResourceController extends Controller
{
    private array $resources = [
        'podcasts' => [
            'endpoint' => '/api/podcasts',
            'model' => Podcast::class,
            'relations' => ['publisher', 'categories', 'authors', 'episodes'],
            'overview' => 'podcasts/overview/PodcastOverview',
            'create' => 'podcasts/create/CreatePodcast',
            'edit' => 'podcasts/edit/EditPodcast',
            'show' => 'podcasts/show/ShowPodcast',
        ],
        'episodes' => [
            'endpoint' => '/api/episodes',
            'model' => Episode::class,
            'relations' => ['podcast'],
            'overview' => 'episodes/overview/EpisodeOverview',
            'create' => 'episodes/create/CreateEpisode',
            'edit' => 'episodes/edit/EditEpisode',
            'show' => 'episodes/show/ShowEpisode',
        ],
        'publishers' => [
            'endpoint' => '/api/publishers',
            'model' => Publisher::class,
            'relations' => [],
            'overview' => 'publishers/overview/PublisherOverview',
            'create' => 'publishers/create/CreatePublisher',
            'edit' => 'publishers/edit/EditPublisher',
            'show' => 'publishers/show/ShowPublisher',
        ],
        'categories' => [
            'endpoint' => '/api/categories',
            'model' => Category::class,
            'relations' => [],
            'overview' => 'categories/overview/CategoryOverview',
            'create' => 'categories/create/CreateCategory',
            'edit' => 'categories/edit/EditCategory',
            'show' => 'categories/show/ShowCategory',
        ],
        'tags' => [
            'endpoint' => '/api/tags',
            'model' => Tag::class,
            'relations' => [],
            'overview' => 'tags/overview/TagOverview',
            'create' => 'tags/create/CreateTag',
            'edit' => 'tags/edit/EditTag',
            'show' => 'tags/show/ShowTag',
        ],
        'authors' => [
            'endpoint' => '/api/authors',
            'model' => Author::class,
            'relations' => [],
            'overview' => 'authors/overview/AuthorOverview',
            'create' => 'authors/create/CreateAuthor',
            'edit' => 'authors/edit/EditAuthor',
            'show' => 'authors/show/ShowAuthor',
        ],
        'users' => [
            'endpoint' => '/api/users',
            'model' => User::class,
            'relations' => [],
            'overview' => 'users/overview/UserOverview',
            'create' => 'users/create/CreateUser',
            'edit' => 'users/edit/EditUser',
            'show' => 'users/show/ShowUser',
        ],
    ];

    public function index(string $resource): Response
    {
        return Inertia::render($this->resource($resource)['overview']);
    }

    public function create(string $resource): Response
    {
        return Inertia::render($this->resource($resource)['create']);
    }

    public function show(string $resource, int $id): Response
    {
        $config = $this->resource($resource);

        return Inertia::render($config['show'], [
            'record' => $this->record($config['endpoint'], $id),
        ]);
    }

    public function edit(string $resource, int $id): Response
    {
        $config = $this->resource($resource);

        return Inertia::render($config['edit'], [
            'record' => $this->record($config['endpoint'], $id),
        ]);
    }

    private function resource(string $resource): array
    {
        abort_unless(isset($this->resources[$resource]), 404);

        return $this->resources[$resource];
    }

    private function record(string $endpoint, int $id): array
    {
        $resource = collect($this->resources)->firstWhere('endpoint', $endpoint);
        abort_unless($resource, 404);

        return $resource['model']::query()
            ->with($resource['relations'])
            ->findOrFail($id)
            ->toArray();
    }
}
