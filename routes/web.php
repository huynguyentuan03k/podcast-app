<?php

use Illuminate\Auth\Middleware\Authenticate;
use Illuminate\Auth\Middleware\EnsureEmailIsVerified;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;

Route::post('/auth/preferences', function (Request $request) {
    $validated = $request->validate([
        'locale' => ['nullable', 'in:en,vi,ja'],
        'appearance' => ['nullable', 'in:light,dark,system'],
    ]);

    if (isset($validated['locale'])) {
        $request->session()->put('locale', $validated['locale']);
    }

    $response = back();

    if (isset($validated['locale'])) {
        $response->withCookie(cookie('locale', $validated['locale'], 60 * 24 * 365));
    }

    if (isset($validated['appearance'])) {
        $response->withCookie(cookie('appearance', $validated['appearance'], 60 * 24 * 365));
    }

    return $response;
})->name('auth.preferences');

Route::middleware(Authenticate::using('admin'))->group(function () {
    Route::get('/', function () {
        return view('app');
    })->name('home');
});

Route::get('dashboard/episodes', function () {
    return redirect('/portal/episodes');
})->name('episodes/index');

Route::get('dashboard/podcasts', function () {
    return redirect('/portal/podcasts');
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

Route::middleware([Authenticate::class, EnsureEmailIsVerified::class])->group(function () {
    Route::get('dashboard', function () {
        return view('app');
    })->name('dashboard');

});

Route::prefix('admin')->name('admin.')->group(function () {
    Route::redirect('/', '/');
    Route::redirect('dashboard', '/')->name('dashboard');

    Route::middleware(Authenticate::using('admin'))->group(function () {
        Route::post('logout', function (Request $request) {
            Auth::guard('admin')->logout();

            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return redirect()->route('login');
        })->name('logout');

        Route::get('{resource}', fn (string $resource) => redirect("/portal/{$resource}"))->name('resources.index');
        Route::get('{resource}/create', fn (string $resource) => redirect("/portal/{$resource}/create"))->name('resources.create');
        Route::get('{resource}/{id}', fn (string $resource, int $id) => redirect("/portal/{$resource}/{$id}/show"))->whereNumber('id')->name('resources.show');
        Route::get('{resource}/{id}/show', fn (string $resource, int $id) => redirect("/portal/{$resource}/{$id}/show"))->whereNumber('id');
        Route::get('{resource}/{id}/edit', fn (string $resource, int $id) => redirect("/portal/{$resource}/{$id}/edit"))->whereNumber('id')->name('resources.edit');
    });
});

Route::prefix('portal')->name('portal.')->middleware(Authenticate::using('admin'))->group(function () {
    Route::get('{any?}', fn () => view('app'))
        ->where('any', '.*')
        ->name('app');
});

Route::middleware(Authenticate::using('admin'))->get('/admin/clear-cache', function () {
    Artisan::call('optimize:clear');

    return response()->json([
        'message' => 'Application cache cleared successfully.',
    ]);
})->name('admin.clear-cache');

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';

Route::view('{any}', 'app')
    ->where('any', '^(?!api).*$')
    ->middleware(Authenticate::using('admin'));
