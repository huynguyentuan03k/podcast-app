<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class AuthorUploadService
{
    public static function store(UploadedFile $file): string
    {
        $folder = "authors/";
        // $extension = $file->getClientOriginalExtension();
        $originalNameFile = $file->getClientOriginalName();
        $timestamp = now()->timestamp;
        $uuid = Str::uuid();

        $filename = "{$timestamp}_{$uuid}_{$originalNameFile}";


        // storage/app/public/authors/
        $file->storeAs($folder, $filename, 'public');

        return $filename;
    }

    /**
     * Summary of getUrl
     * @param string $filename
     * @return string
     */
    public static function getUrl(string $filename):string{
        return Storage::url("authors/$filename");
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
        $path = "authors/$filename";

        if(Storage::disk('public')->exists($path)){
            return Storage::disk('public')->delete($path);
        }

        return false;
    }



    /**
     * Summary of exists
     * @param string $filename
     * @return bool
     */
    public static function exists(string $filename):bool
    {
        $path = "authors/$filename";

        return Storage::disk('public')->exists($path);
    }

    /**
     * Summary of listAll
     * @return string[]
     */
    public static function listAll(): array
    {
        return Storage::disk('public')->files('authors');
    }
}
