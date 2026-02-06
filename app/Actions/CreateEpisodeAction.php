<?php

namespace App\Actions;

use App\Models\Episode;
use App\Models\Podcast;
use App\Services\EpisodeUploadService;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class CreateEpisodeAction
{
    public function handle(array $data): bool
    {
       DB::transaction(function() use ($data){

            if(isset($data['podcast_id'])){
                    $podcast = Podcast::where('id',$data['podcast_id'])->first();

                    // ham isset kiem tra
                    // 1/ co khai bao (ton tai) tuc la kiểm tra xem có cột tên là podcast_id ko , check null
                    // 2/ co bi chekc empty ko (tuc la ton tai ma ko co gia tri)
                    if (isset($data['audio_path']) && $data['audio_path'] instanceof UploadedFile) {
                        $data['audio_path'] = EpisodeUploadService::store($data['audio_path'],$podcast->title);
                    }
                }
                Episode::create(Arr::except($data,['episodes']));

            foreach($data['episodes'] as $item){
                if(isset($item->podcast_id)){
                    $podcast = Podcast::where('id',$item->podcast_id)->first();

                    if (isset($item['audio_path']) && $item['audio_path'] instanceof UploadedFile) {
                        $item['audio_path'] = EpisodeUploadService::store($item['audio_path'],$podcast->title);
                    }
                }

                Episode::create($item);
            }

            return true;

        });

        return false;

    }
}
