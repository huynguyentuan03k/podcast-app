<?php

namespace App\Actions;

use App\Models\Podcast;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Spatie\QueryBuilder\AllowedFilter;
use Spatie\QueryBuilder\QueryBuilder;
use App\Filters\PodcastListSearchAllFilter;
use Spatie\QueryBuilder\AllowedSort;

class GetPodcastListAction
{
    public function handle(?int $perPage): LengthAwarePaginator|Collection
    {
        $query = QueryBuilder::for(Podcast::query()->with(['publisher','categories','authors']))
            ->withCount('episodes')
            ->allowedFilters([
                AllowedFilter::exact('id'),
                AllowedFilter::exact('publisher_id'),
                'title',
                'slug',
                'description',
                AllowedFilter::custom('all', new PodcastListSearchAllFilter()),
                AllowedFilter::callback('publisher_name', function ($query, $value) {
                    $values = is_array($value) ? $value : explode(',', (string) $value);
                    $values = array_values(array_filter(array_map('trim', $values)));

                    if (!count($values)) {
                        return;
                    }

                    $query->whereHas('publisher', function ($query) use ($values) {
                        $query->whereIn('name', $values);
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

            // ->defaultSort('-created_at') , GET /posts?sort=-title,created_at
            ->allowedSorts([
                AllowedSort::field('id'),
                AllowedSort::field('title'),
                AllowedSort::field('slug'),
                AllowedSort::field('episodes_count'),
                AllowedSort::field('created_at'),
            ])

            // mặc định cho id giảm dần
            // order by id desc
            ->defaultSort('-id')
            ;

        if($perPage){
            return $query->paginate($perPage );
        }

        return $query->get();

    }
}
