<?php

namespace App\Actions;

use App\Models\Category;
use Illuminate\Support\Facades\Log;

class UpdateCategoryAction
{
    public function handle(Category $category, array $data): Category
    {
        $category->update($data);
        return $category;
    }
}
