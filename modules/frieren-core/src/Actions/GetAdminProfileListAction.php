<?php

namespace Frieren\Core\Actions;

use Frieren\Core\Models\AdminProfile;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Spatie\QueryBuilder\AllowedFilter;
use Spatie\QueryBuilder\QueryBuilder;

class GetAdminProfileListAction
{
    public function handle(?int $perPage): LengthAwarePaginator
    {
        $query = QueryBuilder::for(AdminProfile::query())
            ->allowedFilters([
                AllowedFilter::exact('id'),
                AllowedFilter::exact('user_admin_id'),
                'employee_code',
                'department',
            ])
            ->defaultSort('-created_at')
            ->allowedSorts(['id', 'user_admin_id', 'employee_code', 'department', 'created_at']);

        return $query->paginate($perPage ?? 10);
    }
}
