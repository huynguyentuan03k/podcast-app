<?php

namespace App\Actions;

use App\Models\Episode;
use App\Models\Podcast;
use App\Services\EpisodeUploadService;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;

class CreateEpisodeAction
{
    public function handle(array $data): Episode
    {

        return DB::transaction(function() use ($data){
            if(isset($data['podcast_id'])){
                $podcast = Podcast::where('id',$data['podcast_id'])->first();

                // ham isset kiem tra
                // 1/ co khai bao (ton tai) tuc la kiểm tra xem có cột tên là podcast_id ko , check null
                // 2/ co bi chekc empty ko (tuc la ton tai ma ko co gia tri)
                if (isset($data['audio_path']) && $data['audio_path'] instanceof UploadedFile) {
                    $data['audio_path'] = EpisodeUploadService::store($data['audio_path'],$podcast->title);
                }
            }

            return Episode::create($data);
        });
    }
}
