<?php

namespace App\Actions;

use App\Models\Episode;
use App\Models\Podcast;
use App\Services\EpisodeUploadService;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;

class UpdateEpisodeAction
{
    public function handle(array $data, Episode $episode): Episode
    {
        DB::transaction(function () use ($data, $episode) {
            if (isset($data['audio_path']) && $data['audio_path'] instanceof UploadedFile) {
                $podcast = Podcast::where('id', $data['podcast_id'])->first();
                $data['audio_path'] = EpisodeUploadService::store($data['audio_path'], $podcast->title);
            }

            $episode->update($data);
        });

        return $episode->fresh();
    }
}
