<?php

namespace App\Actions;

use App\Models\Podcast;
use App\Services\FileUploadService;
use Illuminate\Http\UploadedFile;

class UpdatePodcastAction
{
    public function handle(Podcast $podcast, array $data): Podcast
    {
        // $oldSlug = $podcast->slug;
        
        // if new image
        // if (isset($data['slug']) && $data['cover_image'] instanceof UploadedFile) {
        //     FileUploadService::deleteCoverImage($oldSlug);
        //     $data['cover_image'] = FileUploadService::uploadCoverImage($data['cover_image'], $data['slug'] ?? $oldSlug);
        // }

        // if slug change and image not change
        // if (isset($data['slug']) && $data['slug'] !== $oldSlug && !$data['cover_image']) {
        //     FileUploadService::moveCoverImage($oldSlug, $data['slug']);
        // }

        $podcast->update($data);

        return $podcast;
    }
}
