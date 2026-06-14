<?php

namespace App\Actions;

use App\Models\Episode;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Spatie\QueryBuilder\AllowedFilter;
use Spatie\QueryBuilder\AllowedSort;
use Spatie\QueryBuilder\QueryBuilder;

class GetEpisodeListAction
{
    public function handle(?int $perPage): LengthAwarePaginator
    {
        $query = QueryBuilder::for(Episode::query()->with('podcast'))
            ->allowedFilters([
                // exact filter
                AllowedFilter::exact('podcast_id'),

                // partial filters ( LIKE )
                AllowedFilter::partial('title'),
                AllowedFilter::partial('description'),
                AllowedFilter::partial('audio_path'),
                AllowedFilter::partial('duration'),
                AllowedFilter::partial('published_at'),
                AllowedFilter::callback('all', function ($query, $value) {
                    $search = is_array($value) ? ($value[0] ?? '') : $value;

                    $query->where(function ($query) use ($search) {
                        $query
                            ->where('title', 'like', "%{$search}%")
                            ->orWhere('slug', 'like', "%{$search}%")
                            ->orWhere('description', 'like', "%{$search}%")
                            ->orWhere('audio_path', 'like', "%{$search}%")
                            ->orWhereHas('podcast', function ($query) use ($search) {
                                $query->where('title', 'like', "%{$search}%");
                            });
                    });
                }),
                AllowedFilter::callback('podcast_title', function ($query, $value) {
                    $values = is_array($value) ? $value : explode(',', (string) $value);
                    $values = array_values(array_filter(array_map('trim', $values)));

                    if (!count($values)) {
                        return;
                    }

                    $query->whereHas('podcast', function ($query) use ($values) {
                        $query->whereIn('title', $values);
                    });
                }),
                AllowedFilter::callback('created_from', function ($query, $value) {
                    $date = is_array($value) ? ($value[0] ?? null) : $value;

                    if ($date) {
                        $query->whereDate('created_at', '>=', $date);
                    }
                }),
                AllowedFilter::callback('created_to', function ($query, $value) {
                    $date = is_array($value) ? ($value[0] ?? null) : $value;

                    if ($date) {
                        $query->whereDate('created_at', '<=', $date);
                    }
                }),
            ])
            ->defaultSort('-created_at')
            ->allowedSorts([
                AllowedSort::field('id'),
                AllowedSort::field('podcast_id'),
                AllowedSort::field('title'),
                AllowedSort::field('slug'),
                AllowedSort::field('duration'),
                AllowedSort::field('published_at'),
                AllowedSort::field('created_at'),
            ]);


        return $query->paginate($perPage ?? 10);
    }
}
