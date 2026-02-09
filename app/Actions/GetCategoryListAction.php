<?php

namespace App\Actions;

use App\Models\Category;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Spatie\QueryBuilder\AllowedFilter;
use Spatie\QueryBuilder\QueryBuilder;

class GetCategoryListAction
{
    public function handle(?int $perPage): LengthAwarePaginator|Collection
    {
        $query = QueryBuilder::for(Category::query())
            ->allowedFilters([
                AllowedFilter::exact('id'),
                'title',
                'description',
            ]);
        if($perPage){
            return $query->paginate($perPage);
        }

        return $query->get();
    }
}
