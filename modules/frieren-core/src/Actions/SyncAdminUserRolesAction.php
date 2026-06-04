<?php

namespace Frieren\Core\Actions;

use Frieren\Core\Models\AdminUser;

class SyncAdminUserRolesAction
{
    public function handle(AdminUser $adminUser, array $roleIds): void
    {
        $adminUser->roles()->sync($roleIds);
    }
}
