<?php

namespace Frieren\Crawler\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

final class CrawlerSource extends Model
{
    protected $fillable = [
        'crawler_profile_id',
        'name',
        'type',
        'base_url',
        'host',
        'status',
        'options_override',
        'start_urls',
        'last_crawled_at',
    ];

    protected $casts = [
        'options_override' => 'array',
        'start_urls' => 'array',
        'last_crawled_at' => 'datetime',
    ];

    protected $appends = [
        'url',
    ];

    public function profile(): BelongsTo
    {
        return $this->belongsTo(CrawlerProfile::class, 'crawler_profile_id');
    }

    public function runs(): HasMany
    {
        return $this->hasMany(CrawlerRun::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(CrawlerItem::class);
    }

    public function getUrlAttribute(): string
    {
        return (string) $this->base_url;
    }

    public function setUrlAttribute(string $value): void
    {
        $this->attributes['base_url'] = $value;
        $host = parse_url($value, PHP_URL_HOST);

        if (is_string($host) && $host !== '') {
            $this->attributes['host'] = Str::lower($host);
        }
    }
}
