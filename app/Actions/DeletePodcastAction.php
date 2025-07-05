<?php

namespace App\Actions;

use App\Models\Podcast;
use App\Services\PocastUploadService;

class DeletePodcastAction
{
    public function handle(Podcast $podcast): bool
    {
        PocastUploadService::deleteCoverImage($podcast->slug);

        return $podcast->delete();
    }
}
