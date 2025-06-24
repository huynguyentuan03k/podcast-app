<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;

class AudioFileService
{
    public static function uploadAudio(UploadedFile $file, string $slug):string
    {
        $folder = "episodes/{$slug}";
        $filename = $file->getClientOriginalName();
        $path = $file->storeAs($folder,$filename);
        return $file->getClientOriginalName();
    }
}