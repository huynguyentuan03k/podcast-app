<?php

namespace Frieren\Core\Actions;

use Frieren\Core\Models\AdminUser;

class DeleteAdminUserAction
{
    public function handle(AdminUser $adminUser): bool
    {
        return $adminUser->delete();
    }
}
