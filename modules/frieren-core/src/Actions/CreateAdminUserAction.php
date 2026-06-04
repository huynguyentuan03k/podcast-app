<?php

namespace Frieren\Core\Actions;

use Frieren\Core\Models\AdminUser;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class CreateAdminUserAction
{
    public function handle(array $data): AdminUser
    {
        return DB::transaction(function () use ($data) {
            $data['password'] = Hash::make($data['password']);
            $data['status'] = $data['status'] ?? 'active';

            return AdminUser::create($data);
        });
    }
}
