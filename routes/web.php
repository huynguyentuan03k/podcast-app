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
    })->name('episodes/index');

    Route::get('dashboard/podcasts', fn(): \Inertia\Response => Inertia::render('podcast/index'))->name('episode/index');
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
