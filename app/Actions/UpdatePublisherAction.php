<?php

namespace App\Actions;

use App\Models\Publisher;

class UpdatePublisherAction
{
    public function handle(Publisher $publisher, array $data): Publisher
    {
        $publisher->update($data);
        return $publisher;
    }
}
