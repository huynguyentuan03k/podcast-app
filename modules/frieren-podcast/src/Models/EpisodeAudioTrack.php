<?php

namespace Frieren\Podcast\Models;

use App\Models\Episode;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EpisodeAudioTrack extends Model
{
    protected $fillable = [
        'episode_id',
        'language_id',
        'audio_url',
        'duration_seconds',
        'file_size',
        'mime_type',
        'bitrate',
        'is_primary',
        'metadata',
    ];

    protected $casts = [
        'duration_seconds' => 'integer',
        'file_size' => 'integer',
        'bitrate' => 'integer',
        'is_primary' => 'boolean',
        'metadata' => 'array',
    ];

    public function episode(): BelongsTo
    {
        return $this->belongsTo(Episode::class);
    }

    public function language(): BelongsTo
    {
        return $this->belongsTo(PodcastLanguage::class, 'language_id');
    }
}
