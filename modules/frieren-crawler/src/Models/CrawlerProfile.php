<?php

namespace Frieren\Crawler\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

final class CrawlerProfile extends Model
{
    protected $fillable = [
        'name',
        'key',
        'driver',
        'version',
        'selectors',
        'options',
        'is_active',
        'description',
    ];

    protected $casts = [
        'selectors' => 'array',
        'options' => 'array',
        'is_active' => 'boolean',
    ];

    public function sources(): HasMany
    {
        return $this->hasMany(CrawlerSource::class);
    }

    public function runs(): HasMany
    {
        return $this->hasMany(CrawlerRun::class);
    }
}
