<?php

namespace Frieren\Core\Actions;

use Frieren\Core\Models\AdminProfile;

class UpdateAdminProfileAction
{
    public function handle(AdminProfile $adminProfile, array $data): AdminProfile
    {
        $adminProfile->update($data);

        return $adminProfile->fresh();
    }
}
