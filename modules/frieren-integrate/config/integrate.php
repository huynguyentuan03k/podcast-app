<?php

return [
    'enabled' => env('FRIEREN_INTEGRATE_ENABLED', true),

    'api' => [
        'prefix' => env('FRIEREN_INTEGRATE_API_PREFIX', 'api/integrations'),
        'token' => env('FRIEREN_INTEGRATE_TOKEN'),
        'max_payload_kb' => (int) env('FRIEREN_INTEGRATE_MAX_PAYLOAD_KB', 1024),
    ],

    'rabbitmq' => [
        'host' => env('RABBITMQ_HOST', '127.0.0.1'),
        'port' => (int) env('RABBITMQ_PORT', 5672),
        'user' => env('RABBITMQ_USER', 'guest'),
        'password' => env('RABBITMQ_PASSWORD', 'guest'),
        'vhost' => env('RABBITMQ_VHOST', '/'),
        'exchange' => env('RABBITMQ_EXCHANGE', 'frieren.events'),
        'exchange_type' => 'topic',
        'connection_timeout' => (float) env('RABBITMQ_CONNECTION_TIMEOUT', 3.0),
        'read_write_timeout' => (float) env('RABBITMQ_RW_TIMEOUT', 30.0),
        'heartbeat' => (int) env('RABBITMQ_HEARTBEAT', 15),
        'publisher_confirms' => true,
    ],

    'outbox' => [
        'batch_size' => (int) env('FRIEREN_OUTBOX_BATCH_SIZE', 100),
        'max_attempts' => (int) env('FRIEREN_OUTBOX_MAX_ATTEMPTS', 10),
    ],

    'consumer' => [
        'queue' => env('FRIEREN_INTEGRATION_QUEUE', 'integration.events'),
        'bindings' => [
            'crawler.job.completed',
            'crawler.job.failed',
            'import.completed',
            'import.rejected',
            'episode.published',
            'episode.audio.unavailable',
        ],
        'prefetch_count' => (int) env('FRIEREN_RABBITMQ_PREFETCH', 10),
    ],
];
