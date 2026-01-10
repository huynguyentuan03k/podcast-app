<?php

namespace App\Actions;

use App\Models\Publisher;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Spatie\QueryBuilder\AllowedFilter;
use Spatie\QueryBuilder\QueryBuilder;

class GetPublisherListAction
{
    public function handle(?int $perPage): LengthAwarePaginator|Collection
    {
        $query = QueryBuilder::for(Publisher::query())
            ->allowedFilters([
                AllowedFilter::exact('id'),
                'title',
                'slug',
                'description',

            ]);
        if($perPage){
            return $query->paginate($perPage);
        }

        return $query->get();

    }
}
