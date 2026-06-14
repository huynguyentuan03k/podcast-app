<?php

use Frieren\Integrate\Http\Controllers\CrawlerEventController;
use Illuminate\Support\Facades\Route;

Route::prefix(config('integrate.api.prefix'))
    ->middleware(['api', 'integrate.token', 'throttle:60,1'])
    ->group(function (): void {
        Route::post('/crawler/events', [CrawlerEventController::class, 'store'])
            ->name('integrations.crawler.events.store');
    });
