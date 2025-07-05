<?php

use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

test('users can create a podcast via API', function () {
    // Giả lập user và đăng nhập
    $user = User::factory()->create();
    $this->actingAs($user);

    // Giả lập upload file
    Storage::fake('public');
    $cover = UploadedFile::fake()->image('cover.jpg');

    // Gửi request API tạo podcast
    $response = $this->post('/api/podcasts', [
        'title' => 'podcast',
        'description' => 'desc',
        'slug' => 'podcast',
        'cover' => $cover,
        'publisher_id' => $user->id, // hoặc 1 nếu có sẵn
    ]);


    // Kiểm tra status thay vì redirect
    $response->assertStatus(201); // hoặc assertOk() nếu trả 200

    // Kiểm tra database (dùng tên file, không phải object $cover)
    $this->assertDatabaseHas('podcasts', [
        'title' => 'podcast',
        'description' => 'desc',
        'slug' => 'podcast',
        'user_id' => $user->id,
        // Có thể kiểm tra tên file bằng $cover->hashName()
    ]);

    // Kiểm tra file đã được lưu
    Storage::disk('public')->assertExists('podcasts/' . $cover->hashName());
});
