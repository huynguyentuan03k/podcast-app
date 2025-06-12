<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    Route::get('dashboard/episodes', function () {
        return Inertia::render('episode/index');
    })->name('episodes.index');



    Route::get('podcasts', fn() => Inertia::render('podcast/index'))->name('podcasts.index');
    Route::get('podcasts/create', fn() => Inertia::render('podcast/create'))->name('podcasts.create');
    Route::get('podcasts/{id}', fn($id) => Inertia::render('podcast/show', ['id' => $id]))->name('podcasts.show');
    Route::get('podcasts/{id}/edit', fn($id) => Inertia::render('podcast/edit', ['id' => $id]))->name('podcasts.edit');
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
