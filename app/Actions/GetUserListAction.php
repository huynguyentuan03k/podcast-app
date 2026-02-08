<?php

namespace App\Actions;

use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Spatie\QueryBuilder\QueryBuilder;
use Spatie\QueryBuilder\AllowedFilter;

class GetUserListAction
{
    public function handle(?int $perPage): LengthAwarePaginator|Collection
    {
        $query = QueryBuilder::for(User::query())
        ->allowedFilters([
            AllowedFilter::exact('id'),
            'title',
            'description',
        ]);

        if($perPage){
            return $query->paginate($perPage );
        }

        return $query->get();

    }
}
