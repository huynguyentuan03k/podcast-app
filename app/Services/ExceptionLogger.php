<?php

namespace App\Services;

use Illuminate\Support\Facades\Auth;
use Spatie\Activitylog\Models\Activity;
use Throwable;

class ExceptionLogger
{
    public static function log(Throwable $e)
    {
        Activity::create([
            'log_name' => 'exception',
            'description' => $e->getMessage(),
            'causer_type' => Auth::check() ? get_class(Auth::user()) : null,
            'causer_id' => Auth::id(),
            'properties' => [
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'url'  => request()->fullUrl(),
            ],
            'event' => 'error',
        ]);
    }
}
