<?php

namespace Frieren\Core\Actions;

use Frieren\Core\Models\Permission;

class UpdatePermissionAction
{
    public function handle(Permission $permission, array $data): Permission
    {
        $permission->update($data);

        return $permission->fresh();
    }
}
