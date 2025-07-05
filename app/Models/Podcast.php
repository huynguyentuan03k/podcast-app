<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Podcast extends Model
{
    protected $fillable = [
        'title',
        'slug',
        'description',
        'publisher_id',
        'cover_image',
    ];

    public function episodes(): HasMany
    {
        return $this->hasMany(Episode::class);
    }

    public function authors(): BelongsToMany
    {
        return $this->belongsToMany(Author::class);
    }

    public function categories(): BelongsToMany
    {
        return $this->belongsToMany(Category::class);
    }

    // 1 podcast just 1 publisher => name to publisher not publishers
    public function publisher(): BelongsTo
    {
        return $this->belongsTo(Publisher::class);
    }
}
