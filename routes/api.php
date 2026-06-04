<?php

use App\Http\Controllers\Api\ActivityController;
use App\Http\Controllers\Api\AdminMeController;
use App\Http\Controllers\Api\AdminAuthController;
use App\Http\Controllers\Api\AdminPasswordResetController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\PasswordResetController;
use App\Http\Controllers\Api\UserMeController;
use App\Http\Controllers\Api\AuthorController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\EpisodeController;
use App\Http\Controllers\Api\PodcastController;
use App\Http\Controllers\Api\PublisherController;
use App\Http\Controllers\Api\TagController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->get('/user', function () {
    return request()->user();
});

Route::middleware(['auth:sanctum', 'abilities:user'])->group(function () {
    Route::get('auth/me', UserMeController::class);
});
Route::get('podcasts', [PodcastController::class, 'index']);
Route::get('podcasts/{podcast}', [PodcastController::class, 'show']);
Route::post('podcasts', [PodcastController::class, 'store']);
Route::post('podcasts/{podcast}', [PodcastController::class, 'update']);
Route::delete('podcasts/{podcast}', [PodcastController::class, 'destroy']);

Route::get('episodes', [EpisodeController::class, 'index']);
Route::post('episodes', [EpisodeController::class, 'store']);
Route::get('episodes/{episode}', [EpisodeController::class, 'show']);
Route::put('episodes/{episode}', [EpisodeController::class, 'update']);
Route::delete('episodes/{episode}', [EpisodeController::class, 'destroy']);

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

// authors
Route::get('authors', [AuthorController::class, 'index']);
Route::get('authors/{author}', [AuthorController::class, 'show']);
Route::post('authors', [AuthorController::class, 'store']);
Route::post('authors/{author}', [AuthorController::class, 'update']);
Route::delete('authors/{author}', [AuthorController::class, 'destroy']);

// users
Route::get('users', [UserController::class, 'index']);
Route::get('users/{user}', [UserController::class, 'show']);
Route::post('users', [UserController::class, 'store']);
Route::put('users/{user}', [UserController::class, 'update']);
Route::delete('users/{user}', [UserController::class, 'destroy']);

Route::prefix('auth')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/forgot-password', [PasswordResetController::class, 'forgot']);
    Route::post('/reset-password', [PasswordResetController::class, 'reset']);
    Route::middleware(['auth:sanctum', 'abilities:user'])->group(function () {
        Route::post('logout', [AuthController::class, 'logout']);
    });
});

Route::prefix('admin/auth')->group(function () {
    Route::post('/login', [AdminAuthController::class, 'login']);
    Route::post('/register', [AdminAuthController::class, 'register']);
    Route::post('/forgot-password', [AdminPasswordResetController::class, 'forgot']);
    Route::post('/reset-password', [AdminPasswordResetController::class, 'reset']);
    Route::middleware(['auth:sanctum', 'abilities:admin'])->group(function () {
        Route::post('/logout', [AdminAuthController::class, 'logout']);
        Route::get('/me', AdminMeController::class);
    });
});

// activity

Route::get('/activities',[ActivityController::class,'index']);
Route::get('/activities/{activity}',[ActivityController::class,'show']);
