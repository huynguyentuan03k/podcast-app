<?php

namespace Frieren\Crawler\Models;

use App\Models\Podcast;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

final class CrawlerItem extends Model
{
    protected $fillable = [
        'crawler_source_id',
        'last_crawler_run_id',
        'podcast_id',
        'external_id',
        'title',
        'normalized_title',
        'slug',
        'source_url',
        'source_url_hash',
        'canonical_url',
        'canonical_url_hash',
        'description',
        'thumbnail_url',
        'status',
        'duplicate_of_id',
        'audio_count',
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

    public function source(): BelongsTo
    {
        return $this->belongsTo(CrawlerSource::class, 'crawler_source_id');
    }

    public function lastRun(): BelongsTo
    {
        return $this->belongsTo(CrawlerRun::class, 'last_crawler_run_id');
    }

    public function podcast(): BelongsTo
    {
        return $this->belongsTo(Podcast::class);
    }

    public function duplicateOf(): BelongsTo
    {
        return $this->belongsTo(self::class, 'duplicate_of_id');
    }

    public function audios(): HasMany
    {
        return $this->hasMany(CrawlerItemAudio::class);
    }
}
