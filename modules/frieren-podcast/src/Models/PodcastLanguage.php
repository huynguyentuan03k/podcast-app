<?php

namespace Frieren\Podcast\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PodcastLanguage extends Model
{
    protected $fillable = [
        'code',
        'native_name',
        'english_name',
        'is_active',
        'sort_order',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'sort_order' => 'integer',
    ];

    public function podcastTranslations(): HasMany
    {
        return $this->hasMany(PodcastTranslation::class, 'language_id');
    }

    public function episodeTranslations(): HasMany
    {
        return $this->hasMany(EpisodeTranslation::class, 'language_id');
    }

    public function episodeAudioTracks(): HasMany
    {
        return $this->hasMany(EpisodeAudioTrack::class, 'language_id');
    }
}
