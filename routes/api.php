<?php

use App\Http\Controllers\Api\EpisodeController;
use App\Http\Controllers\Api\PodcastController;
use App\Http\Controllers\Api\PublisherController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;


Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

Route::get('podcasts', [PodcastController::class, 'index']);
Route::get('podcasts/{podcast}', [PodcastController::class, 'show']);
Route::post('podcasts', [PodcastController::class, 'store']);
Route::put('podcasts/{podcast}', [PodcastController::class, 'update']);
Route::delete('podcasts/{podcast}', [PodcastController::class, 'destroy']);

Route::get('episodes', [EpisodeController::class, 'index']);
Route::post('episodes', [EpisodeController::class, 'store']);
// Route::post('/episodes/presign-audio', [EpisodeUploadController::class, 'generatePresignedUrl']);

Route::get('publishers', [PublisherController::class, 'index']);
Route::get('publishers/{publisher}', [PublisherController::class, 'show']);
Route::post('publishers', [PublisherController::class, 'store']);
Route::put('publishers/{publisher}', [PublisherController::class, 'update']);
Route::delete('publishers/{publisher}', [PublisherController::class, 'destroy']);
