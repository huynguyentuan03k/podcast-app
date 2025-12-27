<?php

namespace App\Actions;

use App\Models\Author;
use App\Services\AuthorUploadService;

class UpdateAuthorAction
{
    public function handle(array $data,Author $author): Author
    {
        $author = Author::find($author->id);
        $author->name = $data['name'];
        $author->avatar = AuthorUploadService::update($data['avatar'], $author->avatar);
        $author->bio = $data['bio'];
        $author->website = $data['website'];
        $author->email = $data['email'];

        $author->save();

        return $author;
    }
}
