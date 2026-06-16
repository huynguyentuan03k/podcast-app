<?php

namespace Frieren\Crawler\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class CrawlerJob extends Model
{
    protected $fillable = [
        'crawler_source_id',
        'external_job_id',
        'target_url',
        'status',
        'payload',
        'response',
        'error_message',
        'dispatched_at',
        'finished_at',
    ];

    protected $casts = [
        'payload' => 'array',
        'response' => 'array',
        'dispatched_at' => 'datetime',
        'finished_at' => 'datetime',
    ];

    public function source(): BelongsTo
    {
        return $this->belongsTo(CrawlerSource::class, 'crawler_source_id');
    }
}
