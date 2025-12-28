<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Author extends Model
{
    protected $appends = ['avatar_url'];
    protected $fillable = [
        'name',
        'bio',
        'avatar',
        'email',
        'website',
    ];


    /**
     * Summary of getAvatarUrlAttribute
     * @return string|null
     * ham asset() se tu dong dung APP_URL , nen khong can quan tam den local hay production
     * 
     */
    public function getAvatarUrlAttribute(){
        return $this->avatar ? asset('storage/'. $this->avatar) : null;
    }

    public function podcasts(): BelongsToMany
    {
        return $this->belongsToMany(Podcast::class);
    }
}
