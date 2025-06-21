<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class VoiceActor extends Model
{
    protected $fillable = [
        'name',
        'bio',
        'birth_date',
        'nationality',
        'photo',
    ];

    public function episodes(): HasMany
    {
        return $this->hasMany(Episode::class);
    }
}
