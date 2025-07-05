<?php

namespace App\Actions;

use App\Models\Publisher;

class CreatePublisherAction
{
    public function handle(array $data): Publisher
    {
        return Publisher::create($data);
    }
}
