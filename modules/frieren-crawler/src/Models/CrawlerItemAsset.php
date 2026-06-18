<?php

namespace Frieren\Crawler\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class CrawlerItemAsset extends Model
{
    protected $table = 'crawler_item_assets';

    protected $fillable = [
        'crawler_item_id',
        'last_crawler_run_id',
        'asset_type',
        'external_id',
        'title',
        'position',
        'url',
        'url_hash',
        'mime_type',
        'duration_seconds',
        'content_length',
        'status',
        'metadata',
        'error_message',
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
}
