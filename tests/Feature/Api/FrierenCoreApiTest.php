<?php

use Frieren\Core\Models\AdminProfile;
use Frieren\Core\Models\AdminUser;
use Frieren\Core\Models\Permission;
use Frieren\Core\Models\Role;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;

uses(RefreshDatabase::class);

test('frieren core admin users api works with filters and crud', function () {
    $admin = AdminUser::create([
        'username' => 'root',
        'email' => 'root@example.com',
        'password' => Hash::make('password123'),
        'status' => 'active',
    ]);

    $this->getJson('/api/frieren-core/admin-users')
        ->assertOk()
        ->assertJsonStructure(['data', 'links', 'meta']);

    $this->getJson('/api/frieren-core/admin-users?username=root')
        ->assertOk()
        ->assertJsonPath('data.0.username', 'root');

    $this->getJson("/api/frieren-core/admin-users/{$admin->id}")
        ->assertOk()
        ->assertJsonPath('data.id', $admin->id);

    $this->postJson('/api/frieren-core/admin-users', [
        'username' => 'admin2',
        'email' => 'admin2@example.com',
        'password' => 'password123',
        'password_confirmation' => 'password123',
        'status' => 'active',
    ])->assertCreated();

    $this->putJson("/api/frieren-core/admin-users/{$admin->id}", [
        'username' => 'root-updated',
        'email' => 'root-updated@example.com',
        'status' => 'suspended',
    ])->assertOk()->assertJsonPath('data.username', 'root-updated');

    $this->deleteJson("/api/frieren-core/admin-users/{$admin->id}")
        ->assertOk();
});

test('frieren core role permission and profile api works', function () {
    $admin = AdminUser::create([
        'username' => 'manager',
        'email' => 'manager@example.com',
        'password' => Hash::make('password123'),
        'status' => 'active',
    ]);

    $profile = AdminProfile::create([
        'user_admin_id' => $admin->id,
        'employee_code' => 'EMP001',
        'first_name' => 'Frieren',
        'last_name' => 'Core',
        'department' => 'IT',
        'metadata' => ['level' => 'senior'],
    ]);

    $permission = Permission::create([
        'name' => 'podcasts.create',
        'display_name' => 'Create Podcast',
        'group_name' => 'Podcast',
    ]);

    $role = Role::create([
        'name' => 'super-admin',
        'display_name' => 'Super Admin',
        'description' => 'All access',
    ]);

    $this->getJson('/api/frieren-core/admin-profiles')
        ->assertOk()
        ->assertJsonStructure(['data', 'links', 'meta']);

    $this->getJson('/api/frieren-core/admin-profiles?department=IT')
        ->assertOk()
        ->assertJsonPath('data.0.department', 'IT');

    $this->getJson("/api/frieren-core/admin-profiles/{$profile->id}")
        ->assertOk()
        ->assertJsonPath('data.id', $profile->id);

    $this->getJson('/api/frieren-core/permissions')
        ->assertOk()
        ->assertJsonPath('data.0.name', 'podcasts.create');

    $this->getJson('/api/frieren-core/roles')
        ->assertOk()
        ->assertJsonPath('data.0.name', 'super-admin');

    $this->postJson("/api/frieren-core/roles/{$role->id}/permissions", [
        'permission_ids' => [$permission->id],
    ])->assertOk();

    $this->postJson("/api/frieren-core/admin-users/{$admin->id}/roles", [
        'role_ids' => [$role->id],
    ])->assertOk();

    $this->postJson("/api/frieren-core/admin-users/{$admin->id}/permissions", [
        'permission_ids' => [$permission->id],
    ])->assertOk();
});
