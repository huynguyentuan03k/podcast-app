<?php

namespace Frieren\Integrate\Models;

use Illuminate\Database\Eloquent\Model;

class IntegrationOutbox extends Model
{
    protected $table = 'integration_outbox';

    protected $fillable = [
        'event_id', 'event_type', 'routing_key', 'payload', 'status',
        'attempts', 'available_at', 'published_at', 'last_error',
    ];

    protected $casts = [
        'payload' => 'array',
        'available_at' => 'immutable_datetime',
        'published_at' => 'immutable_datetime',
    ];
}
