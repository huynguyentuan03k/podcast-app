<?php

namespace Frieren\Crawler\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

final class CrawlerSource extends Model
{
    protected $fillable = [
        'name',
        'type',
        'url',
        'status',
        'selectors',
        'options',
        'last_crawled_at',
    ];

    protected $casts = [
        'selectors' => 'array',
        'options' => 'array',
        'last_crawled_at' => 'datetime',
    ];

    public function jobs(): HasMany
    {
        return $this->hasMany(CrawlerJob::class);
    }
}
