<?php

namespace Frieren\Core;

use Illuminate\Support\ServiceProvider;

class FrierenCoreServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->mergeConfigFrom(__DIR__ . '/../config/frieren-core.php', 'frieren-core');
    }

    public function boot(): void
    {
        $this->loadRoutesFrom(__DIR__ . '/../routes/api.php');
        $this->loadMigrationsFrom(__DIR__ . '/../database/migrations');

        $this->publishes([
            __DIR__ . '/../config/frieren-core.php' => config_path('frieren-core.php'),
        ], 'frieren-core-config');
    }
}
