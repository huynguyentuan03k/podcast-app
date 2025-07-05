<?php

namespace App\Actions;

use App\Models\Podcast;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Spatie\QueryBuilder\AllowedFilter;
use Spatie\QueryBuilder\QueryBuilder;
use App\Filters\PodcastListSearchAllFilter;

class GetPodcastListAction
{
    public function handle(?int $perPage): LengthAwarePaginator|Collection
    {
        $query = QueryBuilder::for(Podcast::query())
            ->allowedFilters([
                AllowedFilter::exact('id'),
                AllowedFilter::exact('publisher_id'),
                'title',
                'slug',
                'description',
                AllowedFilter::custom('all', new PodcastListSearchAllFilter()),
            ])
            ->defaultSort('-created_at')
            ->allowedSorts(['id', 'title', 'created_at']);

        return $query->paginate($perPage ?? 10);
    }
}
