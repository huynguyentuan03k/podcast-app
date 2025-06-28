<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;

class AudioFileService
{
    public static function uploadAudio(UploadedFile $file, string $slug): string
    {
        $filename = $slug . '_' . time() . '.' . $file->getClientOriginalExtension();

        // Lưu vào MinIO (disk s3)
        $path = $file->storeAs('episodes', $filename, 's3');

        return $path; // Có thể là URL nếu cần: Storage::disk('s3')->url($path)
    }
}