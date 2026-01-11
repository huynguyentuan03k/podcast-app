<?php

namespace App\Actions;

use App\Models\Podcast;
use App\Services\PocastUploadService;
use Illuminate\Http\UploadedFile;

class UpdatePodcastAction
{
    public function handle(Podcast $podcast, array $data): Podcast
    {
        if(isset($data['cover_image']) && $data['cover_image'] instanceof UploadedFile){
            $data['cover_image'] = PocastUploadService::update($data['cover_image'],$podcast->cover_image);
        }

        $podcast->update($data);

        return $podcast;
    }
}
