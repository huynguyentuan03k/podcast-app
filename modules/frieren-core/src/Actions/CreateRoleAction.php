<?php

namespace Frieren\Core\Actions;

use Frieren\Core\Models\Role;

class CreateRoleAction
{
    public function handle(array $data): Role
    {
        return Role::create($data);
    }
}
