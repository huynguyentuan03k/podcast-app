<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class PocastUploadService
{
    public static function uploadCoverImage(UploadedFile $file, string $title): string
    {
        $extension = $file->getClientOriginalExtension();
        $filename = "{$title}.{$extension}";

        $path = $file->storeAs("podcasts",$filename,"public");

        return $filename;
    }

    public static function getCoverImageUrl(string $slug, string $filename): string
    {
        return Storage::url("podcasts/{$filename}");
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

    public static function renameCoverImage(string $oldTitle, string $newTitle): string
    {
        $disk = Storage::disk('public');

        // find the old file follow name
        $files = $disk->files('podcasts');

        foreach($files as $file){
            if(str_contains($file,$oldTitle)){
                $extension = pathinfo($file, PATHINFO_EXTENSION);
                $newName = "podcasts/{$newTitle}.{$extension}";
                $disk->move($file,$newName);
                return "{$newTitle}.{$extension}";
            }
        }
        return '';
    }
}
