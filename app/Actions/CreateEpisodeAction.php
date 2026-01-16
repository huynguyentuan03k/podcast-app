<?php

namespace App\Actions;

use App\Models\Episode;
use App\Models\Podcast;
use App\Services\EpisodeUploadService;
use Illuminate\Http\UploadedFile;

class CreateEpisodeAction
{
    public function handle(array $data): Episode
    {
        if(isset($data['podcast_id'])){
            $podcast = Podcast::where('id',$data['podcast_id'])->first();

            // ham isset kiem tra
            // 1/ co khai bao (ton tai) tuc la cot podcast_id co gia tri
            // 2/ co bi null ko (tuc la ton tai ma ko co gia tri)
            if (isset($data['audio_path']) && $data['audio_path'] instanceof UploadedFile) {
                $data['audio_path'] = EpisodeUploadService::store($data['audio_path'],$podcast->title);
            }
        }

        return Episode::create($data);
    }
}
