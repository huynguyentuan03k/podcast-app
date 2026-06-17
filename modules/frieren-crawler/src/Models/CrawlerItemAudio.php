<?php

namespace Frieren\Crawler\Models;

use App\Models\Episode;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class CrawlerItemAudio extends Model
{
    protected $fillable = [
        'crawler_item_id',
        'last_crawler_run_id',
        'episode_id',
        'external_id',
        'title',
        'position',
        'audio_url',
        'audio_url_hash',
        'http_status',
        'content_type',
        'content_length',
        'duration_seconds',
        'status',
        'duplicate_of_id',
        'content_hash',
        'metadata',
        'error_message',
        'crawl_count',
        'failure_count',
        'first_discovered_at',
        'last_crawled_at',
        'last_changed_at',
        'imported_at',
    ];

    protected $casts = [
        'metadata' => 'array',
        'first_discovered_at' => 'datetime',
        'last_crawled_at' => 'datetime',
        'last_changed_at' => 'datetime',
        'imported_at' => 'datetime',
    ];

    public function item(): BelongsTo
    {
        return $this->belongsTo(CrawlerItem::class, 'crawler_item_id');
    }

    public function lastRun(): BelongsTo
    {
        return $this->belongsTo(CrawlerRun::class, 'last_crawler_run_id');
    }

    public function episode(): BelongsTo
    {
        return $this->belongsTo(Episode::class);
    }

    public function duplicateOf(): BelongsTo
    {
        return $this->belongsTo(self::class, 'duplicate_of_id');
    }
}
