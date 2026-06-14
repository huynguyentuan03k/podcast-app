<?php

namespace Frieren\Podcast;

use Illuminate\Support\ServiceProvider;

class FrierenPodcastServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->mergeConfigFrom(__DIR__ . '/../config/frieren-podcast.php', 'frieren-podcast');
    }

    public function boot(): void
    {
        $this->loadRoutesFrom(__DIR__ . '/../routes/api.php');
        $this->loadMigrationsFrom(__DIR__ . '/../database/migrations');

        $this->publishes([
            __DIR__ . '/../config/frieren-podcast.php' => config_path('frieren-podcast.php'),
        ], 'frieren-podcast-config');
    }
}
