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
        // ham isset kiem tra 1/ co khai bao (ton tai) va 2/ co bi null ko (tuc la ton tai ma ko co gia tri)
        if (isset($data['audio_path']) && $data['audio_path'] instanceof UploadedFile) {
            $data['audio_path'] = EpisodeUploadService::uploadAudio($data['audio_path'], $data['slug']);
        }

        return Episode::create($data);
    }
}
