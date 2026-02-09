<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class Publisher extends Model
{
    use LogsActivity;
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

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()->logAll()
        ;
    }
}
