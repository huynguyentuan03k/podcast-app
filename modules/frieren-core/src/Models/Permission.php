<?php

namespace Frieren\Core\Models;

use Illuminate\Database\Eloquent\Model;

class Permission extends Model
{
    protected $fillable = [
        'name',
        'display_name',
        'group_name',
    ];
}
