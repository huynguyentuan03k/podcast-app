<?php

namespace Frieren\Integrate\Providers;

use Frieren\Integrate\Console\Commands\PublishOutboxCommand;
use Frieren\Integrate\Console\Commands\SetupRabbitMqCommand;
use Frieren\Integrate\Contracts\EventPublisher;
use Frieren\Integrate\Http\Middleware\VerifyIntegrationToken;
use Frieren\Integrate\RabbitMQ\RabbitMqPublisher;
use Illuminate\Routing\Router;
use Illuminate\Support\ServiceProvider;

final class IntegrateServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->mergeConfigFrom(__DIR__ . '/../../config/integrate.php', 'integrate');
        $this->app->bind(EventPublisher::class, RabbitMqPublisher::class);
    }

    public function boot(Router $router): void
    {
        if (!config('integrate.enabled')) {
            return;
        }

        $router->aliasMiddleware('integrate.token', VerifyIntegrationToken::class);

        $this->loadMigrationsFrom(__DIR__ . '/../../database/migrations');
        $this->loadRoutesFrom(__DIR__ . '/../../routes/api.php');

        $this->publishes([
            __DIR__ . '/../../config/integrate.php' => config_path('integrate.php'),
        ], 'frieren-integrate-config');

        if ($this->app->runningInConsole()) {
            $this->commands([
                PublishOutboxCommand::class,
                SetupRabbitMqCommand::class,
            ]);
        }
    }
}
