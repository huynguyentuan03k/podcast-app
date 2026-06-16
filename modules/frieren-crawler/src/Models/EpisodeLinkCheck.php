<?php

namespace Frieren\Crawler\Models;

use App\Models\Episode;
use App\Models\Podcast;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class EpisodeLinkCheck extends Model
{
    protected $fillable = [
        'podcast_id',
        'episode_id',
        'audio_url',
        'status',
        'http_status',
        'content_type',
        'content_length',
        'error_message',
        'metadata',
        'checked_at',
    ];

    protected $casts = [
        'metadata' => 'array',
        'checked_at' => 'datetime',
    ];

    public function podcast(): BelongsTo
    {
        return $this->belongsTo(Podcast::class);
    }

    public function episode(): BelongsTo
    {
        return $this->belongsTo(Episode::class);
    }
}
