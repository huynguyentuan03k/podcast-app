<?php

namespace Frieren\Core\Actions;

use Frieren\Core\Models\Permission;

class DeletePermissionAction
{
    public function handle(Permission $permission): bool
    {
        return $permission->delete();
    }
}
