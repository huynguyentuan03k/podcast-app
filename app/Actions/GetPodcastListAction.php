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
        $query = QueryBuilder::for(Podcast::query()->with(['publisher','categories','authors']))
            ->withCount('episodes')
            ->allowedFilters([
                AllowedFilter::exact('id'),
                AllowedFilter::exact('publisher_id'),
                'title',
                'slug',
                'description',
                AllowedFilter::custom('all', new PodcastListSearchAllFilter()),
            ])

            // ->defaultSort('-created_at') , GET /posts?sort=-title,created_at
            ->allowedSorts(['id','episodes_count'])

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
