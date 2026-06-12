<?php

namespace App\Http;

use App\Http\Middleware\Demomiddlewareage;
use Illuminate\Foundation\Http\Kernel as HttpKernel;
use Illuminate\Auth\Middleware\Authenticate;
use Illuminate\Auth\Middleware\EnsureEmailIsVerified;
use Illuminate\Auth\Middleware\RedirectIfAuthenticated;
use Illuminate\Routing\Middleware\ThrottleRequests;
use Illuminate\Routing\Middleware\ValidateSignature;
use Laravel\Sanctum\Http\Middleware\CheckAbilities;
use Laravel\Sanctum\Http\Middleware\CheckForAnyAbility;

class Kernel extends HttpKernel
{
    protected $middleware = [
        \Illuminate\Http\Middleware\HandleCors::class,
    ];

    protected $middlewareGroups = [
        'api' => [
            \Illuminate\Routing\Middleware\SubstituteBindings::class,
            \Illuminate\Http\Middleware\HandleCors::class,
        ],
    ];

    protected $middlewareAliases = [
        'auth' => Authenticate::class,
        'guest' => RedirectIfAuthenticated::class,
        'verified' => EnsureEmailIsVerified::class,
        'signed' => ValidateSignature::class,
        'throttle' => ThrottleRequests::class,
        'abilities' => CheckAbilities::class,
        'ability' => CheckForAnyAbility::class,
        'check.age' => Demomiddlewareage::class,
    ];
}
