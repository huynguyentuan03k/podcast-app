<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
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

    public function voiceAction(): BelongsTo
    {
        return $this->belongsTo(Episode::class);
    }

    // trong laraval phai dat la : accessor tuc la getAudioUrlAttribute
    // lam nhu vay trong resource moi dung dc nhu nay : audio_url => $this->audio_url
    public function getAudioUrlAttribute(){
        return $this->audio_file ?? asset("storage/episodes/{$this->podcast->title}/{$this->audio_path}");
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()->logAll();
    }
}
