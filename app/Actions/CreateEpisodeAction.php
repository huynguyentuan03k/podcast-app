<?php

namespace App\Actions;

use App\Models\Episode;
use App\Services\AudioFileService;
use App\Services\EpisodeUploadService;
use App\Services\FileUploadService;
use Illuminate\Http\UploadedFile;

class CreateEpisodeAction
{
    public function handle(array $data): Episode
    {
        dd("data ",$data);
        if (isset($data['audio_path']) && $data['audio_path'] instanceof UploadedFile) {
            $data['audio_path'] = EpisodeUploadService::uploadAudio($data['audio_path'], $data['slug']);
        }
        if (isset($data['cover_image']) && $data['cover_image'] instanceof UploadedFile) {
            $data['cover_image'] = EpisodeUploadService::uploadCoverImage($data['cover_image'], $data['slug']);
        }

        return Episode::create($data);
    }
}
