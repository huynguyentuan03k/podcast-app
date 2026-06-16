<?php

return [
    'enabled' => env('FRIEREN_CRAWLER_ENABLED', true),

    'api' => [
        'prefix' => env('FRIEREN_CRAWLER_API_PREFIX', 'api/frieren-crawler/admin'),
    ],

    'service' => [
        'base_url' => env('FRIEREN_CRAWLER_SERVICE_URL', 'http://127.0.0.1:3101'),
        'timeout' => (int) env('FRIEREN_CRAWLER_SERVICE_TIMEOUT', 45),
        'token' => env('FRIEREN_CRAWLER_SERVICE_TOKEN'),
        'health_path' => env('FRIEREN_CRAWLER_HEALTH_PATH', '/health'),
        'dispatch_path' => env('FRIEREN_CRAWLER_DISPATCH_PATH', '/api/crawl-jobs'),
    ],

    'rabbitmq' => [
        'host' => env('RABBITMQ_HOST', '127.0.0.1'),
        'port' => (int) env('RABBITMQ_PORT', 5672),
        'management_url' => env('RABBITMQ_MANAGEMENT_URL', 'http://127.0.0.1:15672'),
    ],
];
