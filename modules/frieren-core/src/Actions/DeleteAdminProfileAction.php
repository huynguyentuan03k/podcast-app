<?php

namespace Frieren\Core\Actions;

use Frieren\Core\Models\AdminProfile;

class DeleteAdminProfileAction
{
    public function handle(AdminProfile $adminProfile): bool
    {
        return $adminProfile->delete();
    }
}
