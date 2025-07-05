<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class PocastUploadService
{
    public static function uploadCoverImage(UploadedFile $file, string $slug): string
    {
        $folder = "podcasts/{$slug}";
        $filename = $file->getClientOriginalName();
        $path = $file->storeAs($folder, $filename, 'public');
        return $file->getClientOriginalName();
    }

    public static function getCoverImageUrl(string $slug, string $filename): string
    {
        return Storage::url("podcasts/{$slug}/{$filename}");
    }

    public static function moveCoverImage(string $oldSlug, string $newSlug): void
    {
        $oldSlug = "podcasts/{$oldSlug}";
        $newSlug = "podcasts/{$newSlug}";

        if (Storage::disk('public')->exists($oldSlug)) {
            Storage::disk('public')->move($oldSlug, $newSlug);
        }
    }

    public static function deleteCoverImage(string $slug): void
    {
        $folder = "podcasts/{$slug}";
        Storage::disk('public')->deleteDirectory($folder);
    }
}
