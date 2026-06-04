<?php

namespace Frieren\Core\Actions;

use Frieren\Core\Models\AdminUser;

class SyncAdminUserPermissionsAction
{
    public function handle(AdminUser $adminUser, array $permissionIds): void
    {
        $adminUser->permissions()->sync($permissionIds);
    }
}
