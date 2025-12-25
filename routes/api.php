<?php

use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\EpisodeController;
use App\Http\Controllers\Api\PodcastController;
use App\Http\Controllers\Api\PublisherController;
use App\Http\Controllers\Api\TagController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;


Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});
Route::get('podcasts', [PodcastController::class, 'index']);
Route::get('podcasts/{podcast}', [PodcastController::class, 'show']);
Route::post('podcasts', [PodcastController::class, 'store']);
Route::post('podcasts/{podcast}', [PodcastController::class, 'update']);
Route::delete('podcasts/{podcast}', [PodcastController::class, 'destroy']);

Route::get('episodes', [EpisodeController::class, 'index']);
Route::post('episodes', [EpisodeController::class, 'store']);
// Route::post('/episodes/presign-audio', [EpisodeUploadController::class, 'generatePresignedUrl']);

Route::get('publishers', [PublisherController::class, 'index']);
Route::get('publishers/{publisher}', [PublisherController::class, 'show']);
Route::post('publishers', [PublisherController::class, 'store']);
Route::put('publishers/{publisher}', [PublisherController::class, 'update']);
Route::delete('publishers/{publisher}', [PublisherController::class, 'destroy']);

// categories
Route::get('categories', [CategoryController::class, 'index']);
Route::get('categories/{category}', [CategoryController::class, 'show']);
Route::post('categories', [CategoryController::class, 'store']);
Route::put('categories/{category}', [CategoryController::class, 'update']);
Route::delete('categories/{category}', [CategoryController::class, 'destroy']);

// Tags
Route::get('tags', [TagController::class, 'index']);
Route::get('tags/{tag}', [TagController::class, 'show']);
Route::post('tags', [TagController::class, 'store']);
Route::put('tags/{tag}', [TagController::class, 'update']);
Route::delete('tags/{tag}', [TagController::class, 'destroy']);

// categories
Route::get('authors', [CategoryController::class, 'index']);
Route::get('authors/{author}', [CategoryController::class, 'show']);
Route::post('authors', [CategoryController::class, 'store']);
Route::put('authors/{author}', [CategoryController::class, 'update']);
Route::delete('authors/{author}', [CategoryController::class, 'destroy']);
