<?php

namespace Frieren\Core\Actions;

use Frieren\Core\Models\Role;

class SyncRolePermissionsAction
{
    public function handle(Role $role, array $permissionIds): void
    {
        $role->permissions()->sync($permissionIds);
    }
}
