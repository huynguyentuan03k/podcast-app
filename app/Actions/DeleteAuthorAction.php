<?php

namespace App\Actions;

use App\Models\Author;

class DeleteAuthorAction
{
    public function handle(Author $author)
    {
        return $author->delete();
    }
}
