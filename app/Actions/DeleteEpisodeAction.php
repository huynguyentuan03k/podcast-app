<?php

namespace App\Actions;

use App\Models\Episode;

class DeleteEpisodeAction
{
    public function handle(Episode $episode){
        return $episode->delete();
    }
}
