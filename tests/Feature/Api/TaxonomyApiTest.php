<?php

use App\Models\Author;
use App\Models\Category;
use App\Models\Publisher;
use App\Models\Tag;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

test('publishers api works', function () {
    $publisher = Publisher::create([
        'name' => 'Acme Publishing',
        'address' => '123 Main St',
        'email' => 'hello@acme.test',
        'phone' => '123456789',
        'website' => 'https://acme.test',
        'established_year' => 2020,
    ]);

    $this->getJson('/api/publishers')->assertOk();
    $this->getJson("/api/publishers/{$publisher->id}")->assertOk();
    $this->putJson("/api/publishers/{$publisher->id}", [
        'name' => 'Acme Publishing Updated',
    ])->assertOk();
    $this->deleteJson("/api/publishers/{$publisher->id}")->assertOk();
});

test('categories api works', function () {
    $category = Category::create([
        'name' => ['en' => 'Technology'],
        'description' => 'Tech category',
    ]);

    $this->getJson('/api/categories')->assertOk();
    $this->getJson("/api/categories/{$category->id}")->assertOk();
    $this->postJson('/api/categories', [
        'name' => ['en' => 'Business'],
        'description' => 'Business category',
    ])->assertCreated();
    $this->putJson("/api/categories/{$category->id}", [
        'name' => ['en' => 'Technology Updated'],
        'description' => 'Updated description',
    ])->assertOk();
    $this->deleteJson("/api/categories/{$category->id}")->assertOk();
});

test('tags api works', function () {
    $tag = Tag::create([
        'name' => 'Science',
        'slug' => 'science',
    ]);

    $this->getJson('/api/tags')->assertOk();
    $this->getJson("/api/tags/{$tag->id}")->assertOk();
    $this->postJson('/api/tags', [
        'name' => 'History',
    ])->assertCreated();
    $this->putJson("/api/tags/{$tag->id}", [
        'name' => 'Science Updated',
    ])->assertOk();
    $this->deleteJson("/api/tags/{$tag->id}")->assertOk();
});

test('authors api works', function () {
    Storage::fake('public');
    $avatar = UploadedFile::fake()->image('avatar.jpg');

    $author = Author::create([
        'name' => 'Author One',
        'bio' => 'Bio',
        'avatar' => 'avatar.jpg',
        'email' => 'author@example.com',
        'website' => 'https://author.test',
    ]);

    $this->getJson('/api/authors')->assertOk();
    $this->getJson("/api/authors/{$author->id}")->assertOk();
    $this->post('/api/authors', [
        'name' => 'Author Two',
        'bio' => 'Bio 2',
        'website' => 'https://author2.test',
        'email' => 'author2@example.com',
        'avatar' => $avatar,
    ])->assertCreated();
    $this->post("/api/authors/{$author->id}", [
        'name' => 'Author One Updated',
        'bio' => 'Bio updated',
        'website' => 'https://author.test',
        'email' => 'author@example.com',
    ])->assertOk();
    $this->deleteJson("/api/authors/{$author->id}")->assertOk();
});
