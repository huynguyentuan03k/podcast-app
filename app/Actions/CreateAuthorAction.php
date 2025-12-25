<?php

namespace App\Actions;

use App\Models\Author;

class CreateAuthorAction
{
    public function handle(array $data): Author
    {
        return Author::create($data);
    }
}
