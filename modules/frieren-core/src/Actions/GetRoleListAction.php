<?php

namespace Frieren\Core\Actions;

use Frieren\Core\Models\Role;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Spatie\QueryBuilder\AllowedFilter;
use Spatie\QueryBuilder\QueryBuilder;

class GetRoleListAction
{
    public function handle(?int $perPage): LengthAwarePaginator
    {
        $query = QueryBuilder::for(Role::query()->with('permissions'))
            ->allowedFilters([
                AllowedFilter::exact('id'),
                'name',
                'display_name',
            ])
            ->defaultSort('-created_at')
            ->allowedSorts(['id', 'name', 'display_name', 'created_at']);

        return $query->paginate($perPage ?? 10);
    }
}
