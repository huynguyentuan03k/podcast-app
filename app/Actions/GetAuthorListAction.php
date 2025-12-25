<?php

namespace App\Actions;

use App\Models\Author;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Spatie\QueryBuilder\QueryBuilder;
use Spatie\QueryBuilder\AllowedFilter;

class GetAuthorListAction
{
    public function handle(?int $perPage): LengthAwarePaginator|Collection
    {
        $query = QueryBuilder::for(Author::query())
        ->allowedFilters([
            AllowedFilter::exact('id'),
            'title',
            'description',
        ]);

        return $query->paginate($perPage ?? 10);
    }
}
