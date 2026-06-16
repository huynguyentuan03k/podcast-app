<?php

namespace Frieren\Crawler\Providers;

use Illuminate\Support\ServiceProvider;

final class CrawlerServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->mergeConfigFrom(__DIR__ . '/../../config/frieren-crawler.php', 'frieren-crawler');
    }

    public function boot(): void
    {
        if (! config('frieren-crawler.enabled')) {
            return;
        }

        $this->loadMigrationsFrom(__DIR__ . '/../../database/migrations');
        $this->loadRoutesFrom(__DIR__ . '/../../routes/api.php');

        $this->publishes([
            __DIR__ . '/../../config/frieren-crawler.php' => config_path('frieren-crawler.php'),
        ], 'frieren-crawler-config');
    }
}
