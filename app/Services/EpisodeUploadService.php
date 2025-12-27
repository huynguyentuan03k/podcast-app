<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class EpisodeUploadService
{
    public static function uploadAudio(UploadedFile $file, string $slug): string
    {
        $folder = "episodes/audio/{$slug}";
        $filename = $file->getClientOriginalName();
        $path = $file->storeAs($folder,$filename,'public');
        return $file->getClientOriginalName();
    }
    public static function uploadCoverImage(UploadedFile $file, string $slug): string
    {
        $folder = "episodes/{$slug}";
        $filename = $file->getClientOriginalName();
        $path = $file->storeAs($folder,$filename,'public');
        return $file->getClientOriginalName();
    }

    public static function getCoverImageUrl(string $slug, string $filename): string
    {
        return Storage::url("episodes/{$slug}/{$filename}");
    }

    public static function moveCoverImage(string $oldSlug, string $newSlug): void
    {
        $oldSlug = "episodes/{$oldSlug}";
        $newSlug = "episodes/{$newSlug}";

        if(Storage::disk('public')->exists($oldSlug)){
            Storage::disk('public')->move($oldSlug, $newSlug);
        }
    }

    public static function deleteCoverImage(string $slug):void
    {
        $folder = "episodes/{$slug}";
        Storage::disk('public')->deleteDirectory($folder);
    }
}
