<?php

namespace App\Actions;

use App\Models\Author;
use App\Services\AuthorUploadService;

class RegisterUserAction
{
    public function handle(array $data): Author
    {
        if(isset($data['avatar'])){
            $str = AuthorUploadService::store($data['avatar']);
            $data['avatar'] = $str;
        }

        return Author::create($data);
    }
}
