<?php

namespace App\Actions;

use App\Models\Episode;
use App\Services\AudioFileService;
use App\Services\FileUploadService;
use Illuminate\Http\UploadedFile;

class CreateEpisodeAction
{
    public function handle(array $data): Episode
    {
        // Ưu tiên sử dụng path nếu client đã upload trực tiếp
        if (isset($data['audio_file']) && $data['audio_file'] instanceof UploadedFile) {
            $data['audio_file'] = AudioFileService::uploadAudio($data['audio_file'], $data['slug']);
        }

        // Nếu là chuỗi path (client đã upload lên MinIO), không làm gì thêm
        if (isset($data['cover_image']) && $data['cover_image'] instanceof UploadedFile) {
            $data['cover_image'] = FileUploadService::uploadCoverImage($data['cover_image'], $data['slug']);
        }

        return Episode::create($data);
    }
}
