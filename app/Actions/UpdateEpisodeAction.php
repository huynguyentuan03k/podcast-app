<?php

namespace App\Actions;

use App\Models\Episode;
use Illuminate\Support\Facades\DB;

class UpdateEpisodeAction
{
    public function handle(array $data,Episode $episode): Episode
 {
    // thực hiện logic trong transaction và return ngoài transaction

    DB::transaction(function() use ($data, $episode){
        $episode->update($data);
    });

    return $episode;

 }
}
