<?php

namespace Frieren\Core\Actions;

use Frieren\Core\Models\AdminUser;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Spatie\QueryBuilder\AllowedFilter;
use Spatie\QueryBuilder\QueryBuilder;

class GetAdminUserListAction
{
    public function handle(?int $perPage): LengthAwarePaginator
    {
        $query = QueryBuilder::for(AdminUser::query()->with(['profile', 'roles', 'permissions']))
            ->allowedFilters([
                AllowedFilter::exact('id'),
                'username',
                'email',
                'status',
            ])
            ->defaultSort('-created_at')
            ->allowedSorts(['id', 'username', 'email', 'status', 'created_at']);

        return $query->paginate($perPage ?? 10);
    }
}
