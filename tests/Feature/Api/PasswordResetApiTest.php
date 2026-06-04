<?php

use App\Notifications\AdminResetPasswordNotification;
use App\Notifications\UserResetPasswordNotification;
use App\Models\User;
use Frieren\Core\Models\AdminUser;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;

uses(RefreshDatabase::class);

test('user api can request and reset password', function () {
    Notification::fake();

    $user = User::factory()->create([
        'password' => Hash::make('password123'),
    ]);

    $response = $this->postJson('/api/auth/forgot-password', [
        'email' => $user->email,
    ]);

    $response->assertOk();
    Notification::assertSentTo($user, UserResetPasswordNotification::class);

    $token = null;
    Notification::assertSentTo($user, UserResetPasswordNotification::class, function ($notification) use (&$token) {
        $token = $notification->token;
        return true;
    });

    $reset = $this->postJson('/api/auth/reset-password', [
        'token' => $token,
        'email' => $user->email,
        'password' => 'new-password123',
        'password_confirmation' => 'new-password123',
    ]);

    $reset->assertOk();

    $this->assertTrue(Hash::check('new-password123', $user->fresh()->password));
});

test('admin api can request and reset password', function () {
    Notification::fake();

    $admin = AdminUser::create([
        'username' => 'root',
        'email' => 'admin@example.com',
        'password' => Hash::make('password123'),
        'status' => 'active',
    ]);

    $response = $this->postJson('/api/admin/auth/forgot-password', [
        'email' => $admin->email,
    ]);

    $response->assertOk();
    Notification::assertSentTo($admin, AdminResetPasswordNotification::class);

    $token = null;
    Notification::assertSentTo($admin, AdminResetPasswordNotification::class, function ($notification) use (&$token) {
        $token = $notification->token;
        return true;
    });

    $reset = $this->postJson('/api/admin/auth/reset-password', [
        'token' => $token,
        'email' => $admin->email,
        'password' => 'new-password123',
        'password_confirmation' => 'new-password123',
    ]);

    $reset->assertOk();

    $this->assertTrue(Hash::check('new-password123', $admin->fresh()->password));
});
