<?php

use App\Models\User;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

test('api users list returns users', function () {
    User::factory()->count(2)->create();

    $response = $this->getJson('/api/users');

    $response->assertOk()
        ->assertJsonStructure(['data', 'links', 'meta']);
});

test('api users crud works', function () {
    $user = User::factory()->create();

    $show = $this->getJson("/api/users/{$user->id}");
    $show->assertOk()->assertJsonPath('data.id', $user->id);

    $create = $this->postJson('/api/users', [
        'name' => 'New User',
        'email' => 'new@example.com',
        'password' => 'password123',
        'password_confirmation' => 'password123',
    ]);
    $create->assertCreated()->assertJsonPath('data.email', 'new@example.com');

    $update = $this->putJson("/api/users/{$user->id}", [
        'name' => 'Updated User',
        'email' => 'updated@example.com',
        'password' => 'password123',
        'password_confirmation' => 'password123',
    ]);
    $update->assertOk()->assertJsonPath('data.name', 'Updated User');

    $delete = $this->deleteJson("/api/users/{$user->id}");
    $delete->assertOk();

    $this->assertDatabaseMissing('users', [
        'id' => $user->id,
    ]);
});
