<?php

namespace Frieren\Crawler\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

final class CrawlerRun extends Model
{
    protected $fillable = [
        'crawler_source_id',
        'crawler_profile_id',
        'mode',
        'selection',
        'requested_count',
        'processed_count',
        'created_count',
        'updated_count',
        'duplicate_count',
        'failed_count',
        'skipped_count',
        'status',
        'profile_snapshot',
        'options',
        'cursor',
        'error_message',
        'started_at',
        'finished_at',
    ];

    protected $casts = [
        'profile_snapshot' => 'array',
        'options' => 'array',
        'cursor' => 'array',
        'started_at' => 'datetime',
        'finished_at' => 'datetime',
    ];

    public function source(): BelongsTo
    {
        return $this->belongsTo(CrawlerSource::class, 'crawler_source_id');
    }

    public function profile(): BelongsTo
    {
        return $this->belongsTo(CrawlerProfile::class, 'crawler_profile_id');
    }

    public function items(): HasMany
    {
        return $this->hasMany(CrawlerItem::class, 'last_crawler_run_id');
    }

    public function audios(): HasMany
    {
        return $this->hasMany(CrawlerItemAudio::class, 'last_crawler_run_id');
    }
}
