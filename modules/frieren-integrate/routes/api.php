<?php

use Frieren\Integrate\Http\Controllers\CrawlerEventController;
use Frieren\Integrate\Http\Controllers\AdminIntegrationController;
use Illuminate\Auth\Middleware\Authenticate;
use Illuminate\Support\Facades\Route;

Route::prefix(config('integrate.api.prefix'))
    ->middleware(['api', 'integrate.token', 'throttle:60,1'])
    ->group(function (): void {
        Route::post('/crawler/events', [CrawlerEventController::class, 'store'])
            ->name('integrations.crawler.events.store');
    });

Route::prefix('api/frieren-integrate/admin')
    ->middleware(['web', Authenticate::using('admin')])
    ->group(function (): void {
        Route::get('/overview', [AdminIntegrationController::class, 'overview']);
        Route::get('/import-batches', [AdminIntegrationController::class, 'importBatches']);
        Route::get('/import-batches/{importBatch}', [AdminIntegrationController::class, 'importBatch']);
        Route::get('/inbox', [AdminIntegrationController::class, 'inbox']);
        Route::get('/outbox', [AdminIntegrationController::class, 'outbox']);

        Route::middleware('can:admin-permission,UPDATE_INTEGRATION')->group(function (): void {
            Route::patch('/import-batches/{importBatch}/status', [AdminIntegrationController::class, 'updateImportBatchStatus']);
            Route::post('/outbox/{outbox}/retry', [AdminIntegrationController::class, 'retryOutbox']);
            Route::post('/outbox/publish-once', [AdminIntegrationController::class, 'publishOutboxOnce']);
            Route::post('/rabbitmq/setup', [AdminIntegrationController::class, 'setupRabbitMq']);
        });
    });
