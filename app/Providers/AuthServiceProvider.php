<?php

namespace App\Providers;

use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;
use Frieren\Core\Models\AdminUser;
use Frieren\Core\Support\AdminPermission;

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

        Gate::define('admin-permission', function (AdminUser $user, string $permission) {
            return AdminPermission::userHas($user, $permission);
        });
    }
}
