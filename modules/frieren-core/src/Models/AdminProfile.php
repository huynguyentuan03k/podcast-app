<?php

namespace Frieren\Core\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AdminProfile extends Model
{
    protected $table = 'admin_profiles';

    protected $fillable = [
        'user_admin_id',
        'employee_code',
        'first_name',
        'last_name',
        'phone_number',
        'avatar',
        'department',
        'metadata',
    ];

    protected function casts(): array
    {
        return [
            'metadata' => 'array',
        ];
    }

    public function adminUser(): BelongsTo
    {
        return $this->belongsTo(AdminUser::class, 'user_admin_id');
    }
}
