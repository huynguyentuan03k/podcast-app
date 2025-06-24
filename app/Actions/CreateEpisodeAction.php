<?php

namespace App\Actions;

use App\Models\Episode;
use App\Services\AudioFileService;
use Illuminate\Http\UploadedFile;

class CreateEpisodeAction
{
    public function handle(array $data): Episode
    {
        if ($data['audio_file'] && $data['audio_file'] instanceof UploadedFile) {
            $data['audio_file'] = AudioFileService::uploadAudio($data['audio_file'], $data['slug']);
        }
        return Episode::create($data);
    }
}
