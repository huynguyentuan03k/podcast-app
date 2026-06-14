<?php

namespace Frieren\Podcast\Models;

use App\Models\Episode;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EpisodeTranslation extends Model
{
    protected $fillable = [
        'episode_id',
        'language_id',
        'title',
        'slug',
        'description',
        'transcript',
        'metadata',
    ];

    protected $casts = [
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
