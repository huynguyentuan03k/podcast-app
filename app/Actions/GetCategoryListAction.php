<?php

namespace App\Actions;

use App\Models\Category;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Spatie\QueryBuilder\AllowedFilter;
use Spatie\QueryBuilder\AllowedSort;
use Spatie\QueryBuilder\QueryBuilder;

class GetCategoryListAction
{
    public function handle(?int $perPage): LengthAwarePaginator|Collection
    {
        $query = QueryBuilder::for(Category::query())
            ->allowedFilters([
                AllowedFilter::exact('id'),
                'description',
                AllowedFilter::callback('all', function ($query, $value) {
                    $search = is_array($value) ? ($value[0] ?? '') : $value;

                    $query->where(function ($query) use ($search) {
                        $query
                            ->where('name->en', 'like', "%{$search}%")
                            ->orWhere('name->vi', 'like', "%{$search}%")
                            ->orWhere('description', 'like', "%{$search}%");
                    });
                }),
                AllowedFilter::callback('name', function ($query, $value) {
                    $values = is_array($value) ? $value : explode(',', (string) $value);
                    $values = array_values(array_filter(array_map('trim', $values)));

                    if (!count($values)) {
                        return;
                    }

                    $query->where(function ($query) use ($values) {
                        foreach ($values as $name) {
                            $query
                                ->orWhere('name->en', $name)
                                ->orWhere('name->vi', $name);
                        }
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
            ->allowedSorts([
                AllowedSort::field('id'),
                AllowedSort::field('name'),
                AllowedSort::field('created_at'),
            ])
            ->defaultSort('-id')
            ;
        if($perPage){
            return $query->paginate($perPage);
        }

        return $query->get();
    }
}
