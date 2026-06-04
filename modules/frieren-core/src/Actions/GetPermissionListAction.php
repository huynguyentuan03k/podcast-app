<?php

namespace Frieren\Core\Actions;

use Frieren\Core\Models\Permission;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Spatie\QueryBuilder\AllowedFilter;
use Spatie\QueryBuilder\QueryBuilder;

class GetPermissionListAction
{
    public function handle(?int $perPage): LengthAwarePaginator
    {
        $query = QueryBuilder::for(Permission::query())
            ->allowedFilters([
                AllowedFilter::exact('id'),
                'name',
                'display_name',
                'group_name',
            ])
            ->defaultSort('-created_at')
            ->allowedSorts(['id', 'name', 'display_name', 'group_name', 'created_at']);

        return $query->paginate($perPage ?? 10);
    }
}
