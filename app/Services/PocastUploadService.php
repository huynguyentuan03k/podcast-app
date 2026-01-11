<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class PocastUploadService
{
    public static function store(UploadedFile $file): string
    {
        $folder = "podcasts/";

        // orginanal da bao gom luon extension roi
        $originalNameFile = $file->getClientOriginalName();
        $uuid = Str::uuid();
        $timestamp = now()->timestamp;

        $filename = "{$uuid}_{$timestamp}_{$originalNameFile}";

        $file->storeAs("podcasts",$filename,"public");

        return $filename;
    }
    /**
     * Summary of update
     * @param UploadedFile $file
     * @param mixed $oldFilename
     * @return string
     */
    public static function update(UploadedFile $file, ?string $oldFilename = null):string{

        if($oldFilename){
            self::delete($oldFilename);
        }

        return self::store($file);

    }
        /**
     * Summary of delete
     * @param string $filename
     * @return bool
     */
    public static function delete(string $filename):bool
    {
        $path = "podcasts/$filename";

        if(Storage::disk('public')->exists($path)){
            return Storage::disk('public')->delete($path);
        }

        return false;
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
