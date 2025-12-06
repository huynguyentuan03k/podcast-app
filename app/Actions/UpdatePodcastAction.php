<?php

namespace App\Actions;

use App\Models\Podcast;
use App\Services\PocastUploadService;
use Illuminate\Http\UploadedFile;

class UpdatePodcastAction
{
    public function handle(Podcast $podcast, array $data): Podcast
    {
        if ($data['title'] !== $podcast->title && $data['cover_image'] instanceof UploadedFile) {
            $data['cover_image'] = PocastUploadService::renameCoverImage($podcast->title,$data['title']);
        }

        $podcast->update($data);

        return $podcast;
    }
}
