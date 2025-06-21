<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Author extends Model
{
    protected $fillable = [
        'name',
        'bio',
        'avatar',
        'email',
        'website',
    ];
    
    public function podcasts(): BelongsToMany
    {
        return $this->belongsToMany(Podcast::class);
    }
}
