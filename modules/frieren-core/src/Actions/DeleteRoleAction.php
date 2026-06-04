<?php

namespace Frieren\Core\Actions;

use Frieren\Core\Models\Role;

class DeleteRoleAction
{
    public function handle(Role $role): bool
    {
        return $role->delete();
    }
}
