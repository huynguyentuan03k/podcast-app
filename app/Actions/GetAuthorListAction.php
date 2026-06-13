<?php

namespace App\Actions;

use App\Models\Author;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Spatie\QueryBuilder\AllowedFilter;
use Spatie\QueryBuilder\AllowedSort;
use Spatie\QueryBuilder\QueryBuilder;

class GetAuthorListAction
{
    public function handle(?int $perPage): LengthAwarePaginator|Collection
    {
        $query = QueryBuilder::for(Author::query())
        ->allowedFilters([
            AllowedFilter::exact('id'),
            'name',
            'email',
            'website',
            'bio',
            AllowedFilter::callback('all', function ($query, $value) {
                $search = is_array($value) ? ($value[0] ?? '') : $value;

                $query->where(function ($query) use ($search) {
                    $query
                        ->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('website', 'like', "%{$search}%")
                        ->orWhere('bio', 'like', "%{$search}%");
                });
            }),
            AllowedFilter::callback('status', function ($query, $value) {
                $status = is_array($value) ? ($value[0] ?? '') : $value;

                if ($status === 'active') {
                    $query->where(function ($query) {
                        $query->whereNotNull('email')
                            ->orWhereNotNull('website');
                    });
                }

                if ($status === 'inactive') {
                    $query->whereNull('email')
                        ->whereNull('website');
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
            AllowedSort::field('website'),
            AllowedSort::field('created_at'),
        ])
        ->defaultSort('-id');

        if($perPage){
            return $query->paginate($perPage );
        }

        return $query->get();

    }
}
