<?php

namespace Frieren\Core\Actions;

use Frieren\Core\Models\Permission;

class CreatePermissionAction
{
    public function handle(array $data): Permission
    {
        return Permission::create($data);
    }
}
