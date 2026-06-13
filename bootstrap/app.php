<?php

use App\Http\Middleware\Demomiddlewareage;
use App\Http\Middleware\HandleAppearance;
use App\Http\Middleware\SetApiLocale;
use App\Http\Middleware\TranslateApiResponse;
use App\Services\ExceptionLogger;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Auth\Middleware\Authenticate;
use Illuminate\Auth\Middleware\EnsureEmailIsVerified;
use Illuminate\Auth\Middleware\RedirectIfAuthenticated;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Illuminate\Routing\Middleware\ThrottleRequests;
use Illuminate\Routing\Middleware\ValidateSignature;
use Laravel\Sanctum\Http\Middleware\CheckAbilities;
use Laravel\Sanctum\Http\Middleware\CheckForAnyAbility;
use Sentry\Laravel\Integration;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->encryptCookies(except: ['appearance', 'locale', 'sidebar_state']);
        $middleware->redirectGuestsTo(fn () => route('login'));
        $middleware->redirectUsersTo(fn () => route('home'));

        // đây là middleware toàn cục cho prefix api locahost:8000 luôn và đi qua các middleware ở dưới
        $middleware->web(append: [
            HandleAppearance::class,
            AddLinkHeadersForPreloadedAssets::class,
        ]);

        $middleware->api(append: [
            SetApiLocale::class,
            TranslateApiResponse::class,
        ]);

        // khai báo cho middleware cụ thể của 1 router nào đó
        $middleware->alias([
            'auth' => Authenticate::class,
            'guest' => RedirectIfAuthenticated::class,
            'verified' => EnsureEmailIsVerified::class,
            'signed' => ValidateSignature::class,
            'throttle' => ThrottleRequests::class,
            'abilities' => CheckAbilities::class,
            'ability' => CheckForAnyAbility::class,
            'check.age' => Demomiddlewareage::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        Integration::handles($exceptions);

        $exceptions->report(function (Throwable $e) {
            ExceptionLogger::log($e);
        });

    })->create();
