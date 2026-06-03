<?php

use App\Models\Podcast;
use App\Models\Publisher;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

test('podcasts api works', function () {
    Storage::fake('public');

    $publisher = Publisher::create([
        'name' => 'Publisher',
        'address' => 'Address',
        'email' => 'publisher@example.com',
        'phone' => '123456789',
        'website' => 'https://publisher.test',
        'established_year' => 2020,
    ]);

    $podcast = Podcast::create([
        'title' => 'Podcast One',
        'slug' => 'podcast-one',
        'description' => 'Desc',
        'publisher_id' => $publisher->id,
        'content' => 'Content',
        'cover_image' => 'cover.jpg',
    ]);

    $this->getJson('/api/podcasts')->assertOk();
    $this->getJson("/api/podcasts/{$podcast->id}")->assertOk();
    $this->post('/api/podcasts', [
        'title' => 'Podcast Two',
        'slug' => 'podcast-two',
        'description' => 'Desc 2',
        'publisher_id' => $publisher->id,
        'cover_image' => UploadedFile::fake()->image('cover-two.jpg'),
    ])->assertCreated();
    $this->post("/api/podcasts/{$podcast->id}", [
        'title' => 'Podcast Updated',
        'slug' => 'podcast-updated',
        'description' => 'Updated',
        'publisher_id' => $publisher->id,
        'cover_image' => UploadedFile::fake()->image('cover-updated.jpg'),
    ])->assertOk();
    $this->deleteJson("/api/podcasts/{$podcast->id}")->assertStatus(204);
});
