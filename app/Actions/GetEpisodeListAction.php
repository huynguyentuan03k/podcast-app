<?php

namespace App\Actions;

use App\Models\Collection;
use App\Models\Episode;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Spatie\QueryBuilder\AllowedFilter;
use Spatie\QueryBuilder\QueryBuilder;

class GetEpisodeListAction
{
    public function handle(?int $perPage): LengthAwarePaginator|Collection
    {
        $query = QueryBuilder::for(Episode::query())
            ->allowedFilters([
                // exact filter
                AllowedFilter::exact('podcast_id'),

                // partial filters ( LIKE )
                AllowedFilter::partial('title'),
                AllowedFilter::partial('description'),
                AllowedFilter::partial('audio_file'),
                AllowedFilter::partial('duration'),
                AllowedFilter::partial('published_at'),
            ])
            ->defaultSort('-created_at')
            ->allowedSorts([
                'podcast_id',
                'title',
                'description',
                'audio_file',
                'duration',
                'published_at',
                'created_at'
            ]);


        return $query->paginate($perPage ?? 10);
    }
}
