<?php

namespace App\Models;

use \Spatie\Activitylog\Models\Activity as SpatieActivity;

class Activity extends SpatieActivity
{

    // đây chỉ là model kế thừa lại cái model trong src vender/spatie/laravel-activitylog/src/Models/Activity.php
    protected $casts = [
        'properties' => 'array',
    ];
}
