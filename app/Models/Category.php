<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Spatie\Translatable\HasTranslations;

class Category extends Model
{
    use HasTranslations;
    protected $fillable = [
        'name',
        'description'
    ];

    public array $translatable = ['name'];

    public function podcasts(): BelongsToMany
    {
        return $this->belongsToMany(Podcast::class);
    }
}
