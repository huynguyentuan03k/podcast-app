<?php

namespace App\Actions;

use App\Models\Episode;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;

class CreateEpisodeAction
{
    public function handle(array $data): bool
    {
       DB::transaction(function() use ($data){

            Episode::create(Arr::except($data,['episodes']));

            foreach (($data['episodes'] ?? []) as $item) {
                Episode::create($item);
            }

            return true;

        });

        return true;

    }
}
