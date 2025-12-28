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
     * ham asset() se tu dong dung APP_URL , nen khong can quan tam den local hay production , localhost -> APP_URL:port/storage/authors/...
     * $appends = ['avatar_url] laf de tao ra 1 field khi api tra ra , nho phai sua resource author
     */
    public function getAvatarUrlAttribute(){
        return $this->avatar ? asset('storage/authors/'. $this->avatar) : null;
    }

    public function podcasts(): BelongsToMany
    {
        return $this->belongsToMany(Podcast::class);
    }
}
