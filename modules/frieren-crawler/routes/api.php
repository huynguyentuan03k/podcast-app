<?php

use Frieren\Crawler\Http\Controllers\AdminCrawlerController;
use Illuminate\Auth\Middleware\Authenticate;
use Illuminate\Support\Facades\Route;

Route::prefix(config('frieren-crawler.api.prefix'))
    ->middleware(['web', Authenticate::using('admin')])
    ->group(function (): void {
        Route::get('/overview', [AdminCrawlerController::class, 'overview']);
        Route::get('/health', [AdminCrawlerController::class, 'health']);
        Route::get('/sources', [AdminCrawlerController::class, 'sources']);
        Route::get('/sources/{crawlerSource}', [AdminCrawlerController::class, 'showSource']);
        Route::get('/jobs', [AdminCrawlerController::class, 'jobs']);
        Route::get('/items', [AdminCrawlerController::class, 'items']);
        Route::get('/items/{crawlerItem}', [AdminCrawlerController::class, 'showItem']);
        Route::get('/items/{crawlerItem}/audios', [AdminCrawlerController::class, 'itemAudios']);
        Route::get('/audio-candidates', [AdminCrawlerController::class, 'audioCandidates']);
        Route::get('/link-checks', [AdminCrawlerController::class, 'linkChecks']);

        Route::middleware('admin.permission:UPDATE_CRAWLER')->group(function (): void {
            Route::post('/sources', [AdminCrawlerController::class, 'storeSource']);
            Route::put('/sources/{crawlerSource}', [AdminCrawlerController::class, 'updateSource']);
            Route::delete('/sources/{crawlerSource}', [AdminCrawlerController::class, 'destroySource']);
            Route::post('/items', [AdminCrawlerController::class, 'storeItem']);
            Route::put('/items/{crawlerItem}', [AdminCrawlerController::class, 'updateItem']);
            Route::delete('/items/{crawlerItem}', [AdminCrawlerController::class, 'destroyItem']);
            Route::post('/jobs/dispatch', [AdminCrawlerController::class, 'dispatch']);
            Route::post('/items/crawl', [AdminCrawlerController::class, 'crawlItems']);
            Route::post('/items/{crawlerItem}/crawl', [AdminCrawlerController::class, 'crawlItem']);
            Route::post('/podcast-audio/collect', [AdminCrawlerController::class, 'collectPodcastAudio']);
            Route::post('/podcast-audio/import', [AdminCrawlerController::class, 'importPodcastAudio']);
            Route::post('/podcasts/{podcast}/link-checks/run', [AdminCrawlerController::class, 'checkPodcastLinks']);
        });
    });
