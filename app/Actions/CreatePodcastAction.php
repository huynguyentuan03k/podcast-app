<?php

namespace App\Actions;

use App\Models\Podcast;
use App\Services\PocastUploadService;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;

class CreatePodcastAction
{
    public function handle(array $data): Podcast
    {
        // đưa toàn bộ logic vào trong một "Closure". Nếu có bất kỳ lỗi (Exception) nào xảy ra bên trong, Laravel sẽ tự động Rollback (hủy bỏ) mọi thay đổi trước đó.
        return DB::transaction(function() use ($data){

            if (isset($data['cover_image']) && $data['cover_image'] instanceof UploadedFile) {
                $data['cover_image'] = PocastUploadService::store($data['cover_image']);
            }

            $podcast = Podcast::create($data);
            $podcast->categories()->sync($data['category_ids']);
            $podcast->authors()->sync($data['author_ids']);

            return Podcast::create($data);

        });

    }
}
