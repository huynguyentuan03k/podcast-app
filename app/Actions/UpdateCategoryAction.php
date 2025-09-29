<?php

namespace App\Actions;

use App\Models\Category;

class UpdateCategoryAction
{
    public function handle(Category $category, array $data): Category
    {
        $category->update($data);
        return $category;
    }
}
