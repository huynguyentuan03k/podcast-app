<?php

namespace App\Models;

use Frieren\Podcast\Models\EpisodeAudioTrack;
use Frieren\Podcast\Models\EpisodeTranslation;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class Episode extends Model
{
    use LogsActivity;
    protected $appends = ['audio_url'];
    protected $fillable = [
        'podcast_id',
        'title',
        'description',
        'audio_path',
        'duration',
        'published_at',
        'cover_image',
        'slug',
    ];

    public function podcast(): BelongsTo
    {
        return $this->belongsTo(Podcast::class);
    }

    public function translations(): HasMany
    {
        return $this->hasMany(EpisodeTranslation::class);
    }

    public function audioTracks(): HasMany
    {
        return $this->hasMany(EpisodeAudioTrack::class);
    }

    public function voiceAction(): BelongsTo
    {
        return $this->belongsTo(Episode::class);
    }

    // trong laraval phai dat la : accessor tuc la getAudioUrlAttribute
    // lam nhu vay trong resource moi dung dc nhu nay : audio_url => $this->audio_url
    public function getAudioUrlAttribute(){
        if (!$this->audio_path) {
            return null;
        }

        if (filter_var($this->audio_path, FILTER_VALIDATE_URL)) {
            return $this->audio_path;
        }

        return asset("storage/episodes/{$this->podcast->title}/{$this->audio_path}");
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()->logAll();
    }
}
