<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Publisher extends Model
{
    protected $fillable = [
        'name',
        'address',
        'email',
        'phone',
        'website',
        'established_year',
    ];

    public function podcasts(): HasMany
    {
        return $this->hasMany(Podcast::class);
    }
}
