<?php

namespace App\Actions;

use App\Models\Category;
use Illuminate\Support\Facades\Log;

class CreateCategoryAction
{
    public function handle(array $data): Category
    {
        return Category::create($data);
    }
}
