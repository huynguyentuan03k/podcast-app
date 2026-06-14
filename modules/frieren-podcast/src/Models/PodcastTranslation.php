<?php

namespace Frieren\Podcast\Models;

use App\Models\Podcast;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PodcastTranslation extends Model
{
    protected $fillable = [
        'podcast_id',
        'language_id',
        'title',
        'slug',
        'description',
        'content',
        'metadata',
    ];

    protected $casts = [
        'metadata' => 'array',
    ];

    public function podcast(): BelongsTo
    {
        return $this->belongsTo(Podcast::class);
    }

    public function language(): BelongsTo
    {
        return $this->belongsTo(PodcastLanguage::class, 'language_id');
    }
}
