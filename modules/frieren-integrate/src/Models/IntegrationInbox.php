<?php

namespace Frieren\Integrate\Models;

use Illuminate\Database\Eloquent\Model;

class IntegrationInbox extends Model
{
    protected $table = 'integration_inbox';

    protected $fillable = [
        'event_id', 'event_type', 'producer', 'payload', 'status',
        'received_at', 'processed_at', 'error_message',
    ];

    protected $casts = [
        'payload' => 'array',
        'received_at' => 'immutable_datetime',
        'processed_at' => 'immutable_datetime',
    ];
}
