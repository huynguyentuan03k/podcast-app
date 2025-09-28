<?php

namespace App\Actions;

use App\Models\Publisher;

class DeletePublisherAction
{
    public function handle(Publisher $publisher)
    {
        return $publisher->delete();
    }
}
