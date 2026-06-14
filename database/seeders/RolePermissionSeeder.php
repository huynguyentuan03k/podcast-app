<?php

namespace Database\Seeders;

use Frieren\Core\Models\AdminUser;
use Frieren\Core\Models\Permission;
use Frieren\Core\Models\Role;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        $permissionGroups = [
            'dashboard' => ['view'],
            'user' => ['view', 'create', 'update', 'delete'],
            'admin_user' => ['view', 'create', 'update', 'delete'],
            'admin_profile' => ['view', 'create', 'update', 'delete'],
            'role' => ['view', 'create', 'update', 'delete'],
            'permission' => ['view', 'create', 'update', 'delete'],
            'podcast' => ['view', 'create', 'update', 'delete'],
            'author' => ['view', 'create', 'update', 'delete'],
            'category' => ['view', 'create', 'update', 'delete'],
            'publisher' => ['view', 'create', 'update', 'delete'],
            'episode' => ['view', 'create', 'update', 'delete'],
            'tag' => ['view', 'create', 'update', 'delete'],
            'setting' => ['view', 'update'],
            'activity' => ['view'],
        ];

        $permissions = [];

        foreach ($permissionGroups as $groupName => $actions) {
            foreach ($actions as $action) {
                $name = "{$groupName}.{$action}";

                $permissions[] = Permission::firstOrCreate(
                    ['name' => $name],
                    [
                        'display_name' => str_replace('_', ' ', $groupName) . ' ' . $action,
                        'group_name' => $groupName,
                    ]
                );
            }
        }

        $role = Role::firstOrCreate(
            ['name' => 'super-admin'],
            [
                'display_name' => 'Super Admin',
                'description' => 'Full access to the portal administration module.',
            ]
        );

        $role->permissions()->sync(collect($permissions)->pluck('id')->all());

        $adminEmail = env('DEFAULT_ADMIN_EMAIL', 'admin@email.com');
        $adminPassword = env('DEFAULT_ADMIN_PASSWORD', 'Aa12345@');

        $admin = AdminUser::firstOrCreate(
            ['email' => $adminEmail],
            [
                'username' => 'superadmin',
                'password' => Hash::make($adminPassword),
                'status' => 'active',
            ]
        );

        $admin->roles()->syncWithoutDetaching([$role->id]);
    }
}
