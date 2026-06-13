<?php

namespace App\Actions;

use App\Models\Publisher;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Spatie\QueryBuilder\AllowedFilter;
use Spatie\QueryBuilder\AllowedSort;
use Spatie\QueryBuilder\QueryBuilder;

class GetPublisherListAction
{
    public function handle(?int $perPage): LengthAwarePaginator|Collection
    {
        $query = QueryBuilder::for(Publisher::query())
            ->allowedFilters([
                AllowedFilter::exact('id'),
                'name',
                'email',
                'phone',
                'website',
                'address',
                AllowedFilter::callback('all', function ($query, $value) {
                    $search = is_array($value) ? ($value[0] ?? '') : $value;

                    $query->where(function ($query) use ($search) {
                        $query
                            ->where('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%")
                            ->orWhere('phone', 'like', "%{$search}%")
                            ->orWhere('website', 'like', "%{$search}%")
                            ->orWhere('address', 'like', "%{$search}%");
                    });
                }),
                AllowedFilter::callback('established_years', function ($query, $value) {
                    $years = is_array($value) ? $value : explode(',', (string) $value);
                    $years = array_values(array_filter(array_map('trim', $years)));

                    if (count($years)) {
                        $query->whereIn('established_year', $years);
                    }
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
                AllowedSort::field('email'),
                AllowedSort::field('established_year'),
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
