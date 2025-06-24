<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Episode extends Model
{
    protected $fillable = [
        'podcast_id',
        'title',
        'description',
        'audio_file',
        'duration',
        'published_at',
        'cover_image'
    ];

    public function podcast(): BelongsTo
    {
        return $this->belongsTo(Podcast::class);
    }

    public function voiceAction(): BelongsTo
    {
        return $this->belongsTo(Episode::class);
    }
}
