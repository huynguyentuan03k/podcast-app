<?php

namespace Frieren\Core\Actions;

use Frieren\Core\Models\AdminUser;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class UpdateAdminUserAction
{
    public function handle(AdminUser $adminUser, array $data): AdminUser
    {
        return DB::transaction(function () use ($adminUser, $data) {
            if (array_key_exists('password', $data) && filled($data['password'])) {
                $data['password'] = Hash::make($data['password']);
            } else {
                unset($data['password']);
            }

            $adminUser->update($data);

            return $adminUser->fresh()->load(['profile', 'roles', 'permissions']);
        });
    }
}
