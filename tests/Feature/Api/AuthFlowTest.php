<?php

use App\Models\User;
use Frieren\Core\Models\AdminUser;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;

uses(RefreshDatabase::class);

test('user auth flow supports login me and logout', function () {
    $user = User::factory()->create([
        'password' => Hash::make('password123'),
    ]);

    $login = $this->postJson('/api/auth/login', [
        'email' => $user->email,
        'password' => 'password123',
    ]);

    $login->assertOk()
        ->assertJsonPath('client', 'web-mobile')
        ->assertJsonStructure(['message', 'token', 'client', 'user']);

    $token = $login->json('token');

    $this->withHeader('Authorization', 'Bearer ' . $token)
        ->withHeader('Accept', 'application/json')
        ->getJson('/api/auth/me')
        ->assertOk()
        ->assertJsonPath('data.email', $user->email);

    $this->withHeader('Authorization', 'Bearer ' . $token)
        ->postJson('/api/auth/logout')
        ->assertOk();

    $this->withHeader('Authorization', 'Bearer ' . $token)
        ->withHeader('Accept', 'application/json')
        ->getJson('/api/auth/me')
        ->assertUnauthorized();
});

test('admin auth flow supports login me and logout', function () {
    $admin = AdminUser::create([
        'username' => 'root',
        'email' => 'admin@example.com',
        'password' => Hash::make('password123'),
        'status' => 'active',
    ]);

    $login = $this->postJson('/api/admin/auth/login', [
        'email' => $admin->email,
        'password' => 'password123',
    ]);

    $login->assertOk()
        ->assertJsonPath('client', 'admin')
        ->assertJsonStructure(['message', 'token', 'client', 'user']);

    $token = $login->json('token');

    $this->withHeader('Authorization', 'Bearer ' . $token)
        ->withHeader('Accept', 'application/json')
        ->getJson('/api/admin/auth/me')
        ->assertOk()
        ->assertJsonPath('data.email', $admin->email);

    $this->withHeader('Authorization', 'Bearer ' . $token)
        ->postJson('/api/admin/auth/logout')
        ->assertOk();

    $this->withHeader('Authorization', 'Bearer ' . $token)
        ->withHeader('Accept', 'application/json')
        ->getJson('/api/admin/auth/me')
        ->assertUnauthorized();
});
