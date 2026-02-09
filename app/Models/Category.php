<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Translatable\HasTranslations;

class Category extends Model
{
    use HasTranslations, LogsActivity;
    protected $fillable = [
        'name',
        'description'
    ];

    public array $translatable = ['name'];

    public function podcasts(): BelongsToMany
    {
        return $this->belongsToMany(Podcast::class);
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
        ->logAll()
        ->useAttributeRawValues(['name'])
        ;
    }
}
