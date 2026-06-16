<?php

namespace Frieren\Crawler\Models;

use App\Models\Episode;
use App\Models\Podcast;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class CrawlerAudioCandidate extends Model
{
    protected $fillable = [
        'crawler_job_id',
        'crawler_source_id',
        'podcast_id',
        'episode_id',
        'title',
        'slug',
        'audio_url',
        'status',
        'http_status',
        'content_type',
        'content_length',
        'duration_seconds',
        'error_message',
        'metadata',
        'validated_at',
        'imported_at',
    ];

    protected $casts = [
        'metadata' => 'array',
        'validated_at' => 'datetime',
        'imported_at' => 'datetime',
    ];

    public function podcast(): BelongsTo
    {
        return $this->belongsTo(Podcast::class);
    }

    public function episode(): BelongsTo
    {
        return $this->belongsTo(Episode::class);
    }

    public function source(): BelongsTo
    {
        return $this->belongsTo(CrawlerSource::class, 'crawler_source_id');
    }

    public function job(): BelongsTo
    {
        return $this->belongsTo(CrawlerJob::class, 'crawler_job_id');
    }
}
