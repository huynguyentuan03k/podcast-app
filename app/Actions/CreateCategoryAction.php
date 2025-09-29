<?php

namespace App\Actions;

use App\Models\Category;

class CreateCategoryAction
{
    public function handle(array $data): Category
    {
        return Category::create($data);
    }
}
