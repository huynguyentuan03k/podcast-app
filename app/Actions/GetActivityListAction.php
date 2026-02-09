<?php

namespace App\Actions;

use App\Models\Activity;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Spatie\QueryBuilder\AllowedFilter;
use Spatie\QueryBuilder\QueryBuilder;

class GetActivityListAction
{
    public function handle(?int $perPage): LengthAwarePaginator|Collection
    {
        $query = QueryBuilder::for(Activity::query())
            ->allowedFilters([
                AllowedFilter::exact('id'),
                'log_name'
            ]);

        if($perPage){
            return $query->paginate($perPage );
        }

        return $query->get();
    }
}
