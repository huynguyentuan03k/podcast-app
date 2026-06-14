<?php

namespace Frieren\Core\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserPreference extends Model
{
    protected $fillable = [
        'user_id',
        'language',
        'theme',
        'notification_enabled',
        'email_notification_enabled',
        'push_notification_enabled',
        'autoplay_enabled',
        'playback_speed',
        'metadata',
    ];

    protected function casts(): array
    {
        return [
            'notification_enabled' => 'boolean',
            'email_notification_enabled' => 'boolean',
            'push_notification_enabled' => 'boolean',
            'autoplay_enabled' => 'boolean',
            'playback_speed' => 'decimal:2',
            'metadata' => 'array',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
