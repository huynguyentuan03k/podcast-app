<?php

namespace App\Actions;

use App\Models\Podcast;
use App\Services\PocastUploadService;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class UpdatePodcastAction
{
    public function handle(Podcast $podcast, array $data): Podcast
    {


        return DB::transaction(function() use ($data,$podcast){

                    if(isset($data['cover_image']) && $data['cover_image'] instanceof UploadedFile){
                        $data['cover_image'] = PocastUploadService::update($data['cover_image'],$podcast->cover_image);
                    }

                    // hàm update cho $podcast đã tự save rồi ko cần save
                    // còn authors và categories thì là quan hệ 1-n nên chỉ cần tạo thêm quan hệ thôi
                    // riêng publisher là 1 cột trong podcast table nên phải save mà nó đã dc gấn vào $data rồi và đã đc save khi dùng update()

                    // hàm sync 1 thêm relation mới 2 xoá relation cũ không còn 3 giữ nguyên relation trùng
                    $podcast->update(Arr::except($data,['author_ids','category_ids']));
                    $podcast->authors()->sync($data['author_ids'] ?? []);
                    $podcast->categories()->sync($data['category_ids'] ?? []);

                    return $podcast;

        });

    }
}
