<?php

return [
    App\Providers\AppServiceProvider::class,
    App\Providers\AuthServiceProvider::class,
    App\Providers\HorizonServiceProvider::class,
    ...((($_ENV['APP_ENV'] ?? $_SERVER['APP_ENV'] ?? 'production') === 'local') ? [
        App\Providers\TelescopeServiceProvider::class,
    ] : []),
];
