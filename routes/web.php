<?php

use App\Http\Controllers\Admin\Auth\AuthenticatedSessionController as AdminAuthenticatedSessionController;
use App\Http\Controllers\Admin\Auth\NewPasswordController as AdminNewPasswordController;
use App\Http\Controllers\Admin\Auth\PasswordResetLinkController as AdminPasswordResetLinkController;
use App\Http\Controllers\Admin\Auth\RegisteredAdminController;
use App\Http\Controllers\Admin\PortalResourceController;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return view('app');
})->name('home');

Route::get('dashboard/episodes', function () {
    return request()->header('X-Inertia') ? Inertia::location('/portal/episodes') : redirect('/portal/episodes');
})->name('episodes/index');

Route::get('dashboard/podcasts', function () {
    return request()->header('X-Inertia') ? Inertia::location('/portal/podcasts') : redirect('/portal/podcasts');
})->name('episode/index');

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

Route::get('/test/{age}', function () {
    return 'oke';
})->middleware('check.age');

Route::get('/test-sentry', function () {
    throw new Exception('Test sentry error');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return view('app');
    })->name('dashboard');

});

Route::prefix('admin')->name('admin.')->group(function () {
    Route::redirect('/', '/');
    Route::redirect('dashboard', '/')->name('dashboard');

    Route::middleware('guest:admin')->group(function () {
        Route::get('register', [RegisteredAdminController::class, 'create'])->name('register');
        Route::post('register', [RegisteredAdminController::class, 'store']);

        Route::get('login', [AdminAuthenticatedSessionController::class, 'create'])->name('login');
        Route::post('login', [AdminAuthenticatedSessionController::class, 'store']);

        Route::get('forgot-password', [AdminPasswordResetLinkController::class, 'create'])->name('password.request');
        Route::post('forgot-password', [AdminPasswordResetLinkController::class, 'store'])->name('password.email');

        Route::get('reset-password/{token}', [AdminNewPasswordController::class, 'create'])->name('password.reset');
        Route::post('reset-password', [AdminNewPasswordController::class, 'store'])->name('password.store');
    });

    Route::middleware('auth:admin')->group(function () {
        Route::get('{resource}', fn (string $resource) => redirect("/portal/{$resource}"))->name('resources.index');
        Route::get('{resource}/create', fn (string $resource) => redirect("/portal/{$resource}/create"))->name('resources.create');
        Route::get('{resource}/{id}', fn (string $resource, int $id) => redirect("/portal/{$resource}/{$id}/show"))->whereNumber('id')->name('resources.show');
        Route::get('{resource}/{id}/show', fn (string $resource, int $id) => redirect("/portal/{$resource}/{$id}/show"))->whereNumber('id');
        Route::get('{resource}/{id}/edit', fn (string $resource, int $id) => redirect("/portal/{$resource}/{$id}/edit"))->whereNumber('id')->name('resources.edit');
        Route::post('logout', [AdminAuthenticatedSessionController::class, 'destroy'])->name('logout');
    });
});

Route::prefix('portal')->name('portal.')->middleware('auth:admin')->group(function () {
    Route::get('aboutme', fn () => redirect('/settings/profile'))->name('aboutme');
    Route::get('{resource}', [PortalResourceController::class, 'index'])->name('resources.index');
    Route::get('{resource}/create', [PortalResourceController::class, 'create'])->name('resources.create');
    Route::get('{resource}/{id}', fn (string $resource, int $id) => redirect("/portal/{$resource}/{$id}/show"))->whereNumber('id');
    Route::get('{resource}/{id}/show', [PortalResourceController::class, 'show'])->whereNumber('id')->name('resources.show');
    Route::get('{resource}/{id}/edit', [PortalResourceController::class, 'edit'])->whereNumber('id')->name('resources.edit');
    Route::get('{resource}/{id}/delete', fn (string $resource, int $id) => redirect("/portal/{$resource}"))->whereNumber('id')->name('resources.delete');
});

Route::middleware('auth:admin')->get('/admin/clear-cache', function () {
    Artisan::call('optimize:clear');

    return response()->json([
        'message' => 'Application cache cleared successfully.',
    ]);
})->name('admin.clear-cache');

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';

Route::view('{any}', 'app')
    ->where('any', '^(?!api).*$');
