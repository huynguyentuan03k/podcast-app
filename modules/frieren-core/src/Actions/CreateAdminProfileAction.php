<?php

namespace Frieren\Core\Actions;

use Frieren\Core\Models\AdminProfile;

class CreateAdminProfileAction
{
    public function handle(array $data): AdminProfile
    {
        return AdminProfile::create($data);
    }
}
