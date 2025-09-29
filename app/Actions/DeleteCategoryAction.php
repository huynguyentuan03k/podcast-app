<?php

namespace App\Actions;

use App\Models\Category;

class DeleteCategoryAction
{
    public function handle(Category $category)
    {
        return $category->delete();
    }
}
