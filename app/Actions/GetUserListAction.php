<?php

namespace App\Actions;

use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Spatie\QueryBuilder\QueryBuilder;
use Spatie\QueryBuilder\AllowedFilter;
use Spatie\QueryBuilder\AllowedSort;

class GetUserListAction
{
    public function handle(?int $perPage): LengthAwarePaginator|Collection
    {
        $query = QueryBuilder::for(User::query()->with(['profile', 'preference'])->withCount(['devices', 'socialAccounts']))
        ->allowedFilters([
            AllowedFilter::exact('id'),
            'name',
            'email',
            AllowedFilter::callback('all', function ($query, $value) {
                $search = is_array($value) ? ($value[0] ?? '') : $value;

                $query->where(function ($query) use ($search) {
                    $query
                        ->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhereHas('profile', function ($query) use ($search) {
                            $query
                                ->where('display_name', 'like', "%{$search}%")
                                ->orWhere('phone_number', 'like', "%{$search}%");
                        });
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
            AllowedFilter::callback('email_status', function ($query, $value) {
                $statuses = is_array($value) ? $value : explode(',', (string) $value);

                if (in_array('verified', $statuses, true) && ! in_array('unverified', $statuses, true)) {
                    $query->whereNotNull('email_verified_at');
                }

                if (in_array('unverified', $statuses, true) && ! in_array('verified', $statuses, true)) {
                    $query->whereNull('email_verified_at');
                }
            }),
        ])
        ->allowedSorts([
            AllowedSort::field('id'),
            AllowedSort::field('name'),
            AllowedSort::field('email'),
            AllowedSort::field('created_at'),
            AllowedSort::field('updated_at'),
        ])
        ->defaultSort('-id');

        if($perPage){
            return $query->paginate($perPage );
        }

        return $query->get();

    }
}
