<?php

namespace App\Actions;

use App\Models\Podcast;
use App\Services\PocastUploadService;
use Illuminate\Http\UploadedFile;

class CreatePodcastAction
{
    public function handle(array $data): Podcast
    {
        if (isset($data['cover_image']) && $data['cover_image'] instanceof UploadedFile) {
            $data['cover_image'] = PocastUploadService::uploadCoverImage($data['cover_image'], $data['slug']);
        }
        return Podcast::create($data);
    }
}
