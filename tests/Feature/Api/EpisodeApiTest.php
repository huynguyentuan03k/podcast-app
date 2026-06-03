<?php

use App\Models\Episode;
use App\Models\Podcast;
use App\Models\Publisher;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

test('episodes api works', function () {
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

    $episode = Episode::create([
        'podcast_id' => $podcast->id,
        'title' => 'Episode One',
        'slug' => 'episode-one',
        'description' => 'Episode desc',
        'audio_path' => 'audio.mp3',
        'duration' => '00:05:00',
        'cover_image' => 'cover.jpg',
    ]);

    $this->getJson('/api/episodes')->assertOk();
    $this->getJson("/api/episodes/{$episode->id}")->assertOk();
    $this->post('/api/episodes', [
        'title' => 'Episode Two',
        'slug' => 'episode-two',
        'description' => 'Episode desc 2',
        'podcast_id' => $podcast->id,
        'duration' => '00:03:00',
        'audio_path' => UploadedFile::fake()->create('audio-two.mp3', 100, 'audio/mpeg'),
        'cover_image' => UploadedFile::fake()->image('cover-two.jpg'),
    ])->assertCreated();
    $this->put("/api/episodes/{$episode->id}", [
        'title' => 'Episode Updated',
        'slug' => 'episode-updated',
        'description' => 'Updated',
        'podcast_id' => $podcast->id,
        'duration' => '00:04:00',
        'audio_path' => UploadedFile::fake()->create('audio-updated.mp3', 100, 'audio/mpeg'),
        'cover_image' => UploadedFile::fake()->image('cover-updated.jpg'),
    ])->assertOk();
    $this->deleteJson("/api/episodes/{$episode->id}")->assertOk();
});
