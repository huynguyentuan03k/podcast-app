<?php

use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');


/**
 * 1/ client_max_body_size 100M: php-fpm or php cli;
 * gioi han toan bo request body
 *
 * 2/ post_max_size = 100M : php-fpm or php cli; la tong dung luong POST
 * bao gom :
 * form fields
 * file upload
 * JSON body
 *
 * 3/ upload_max_filesize = 100M : nginx or php-fpm or php-cli
 * kich thuoc 1 file upload
 *
 * 4/ upload_max_filesize: php-fpm or php-cli
 */
Route::get('/phpinfo', function () {
   phpinfo();
});

Route::get('/test-sentry', function () {
    throw new Exception('Test sentry error');
});
Route::get('/test-log', function () {
    Log::info('This is an info message');
    Log::warning('User {id} failed to login.', ['id' => 1]);
    Log::error('This is an error message');

    Log::channel('sentry_logs')->error('This will only go to Sentry');

    return 'Logged!';
});

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
