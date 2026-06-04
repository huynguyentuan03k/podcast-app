<?php

namespace App\Providers;

use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AuthServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        Gate::define('view-frieren-core', function ($user) {
            return method_exists($user, 'tokenCan') && $user->tokenCan('admin');
        });

        Gate::define('use-user-api', function ($user) {
            return method_exists($user, 'tokenCan') && $user->tokenCan('user');
        });
    }
}
