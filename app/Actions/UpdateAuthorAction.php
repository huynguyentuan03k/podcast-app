<?php

namespace App\Actions;

use App\Models\Author;

class UpdateAuthorAction
{
    public function handle(array $data,Author $author): Author
    {
        $author = Author::find($author->id);
        $author->name = $data['name'];
        $author->save();

        return $author;
    }
}
