<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class EpisodeUploadService
{
    public static function store(UploadedFile $file,string $titlePodcast): string
    {
        $folder = "episodes/{$titlePodcast}";
        // getClientOriginalName co form the nay : haiphan.mp3
        $originalNameFile = $file->getClientOriginalName();

        $timestamp = now()->timestamp;
        $uuid = Str::uuid();

        $filename = "{$timestamp}_{$uuid}_{$originalNameFile}";

        $file->storeAs($folder,$filename,'public');

        return $filename;
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
