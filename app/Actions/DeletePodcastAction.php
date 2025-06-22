<?php

namespace App\Actions;

use App\Models\Podcast;
use App\Services\FileUploadService;

class DeletePodcastAction
{
    public function handle(Podcast $podcast): bool
    {
        FileUploadService::deleteCoverImage($podcast->slug);

        return $podcast->delete();
    }
}