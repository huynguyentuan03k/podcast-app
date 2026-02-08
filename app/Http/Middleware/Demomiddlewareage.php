<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Closure;
use Illuminate\Support\Facades\Log;
// Response trong middleware mới dùng HttpFoundation còn ở controller thì dùng Http use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class Demomiddlewareage{
    public function handle(Request $request, Closure $next): Response{
        $age = $request->route('age');
        
        if($age < 19){
            return response('not oke');
        }

        Log::info("1",['so mot']);

        return $next($request);
    }
}
