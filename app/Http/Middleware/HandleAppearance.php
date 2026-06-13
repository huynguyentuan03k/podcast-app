<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Support\Facades\App;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\View;
use Symfony\Component\HttpFoundation\Response;

class HandleAppearance
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $locale = $request->session()->get('locale', $request->cookie('locale') ?? config('app.locale'));

        if (! in_array($locale, ['en', 'vi', 'ja'], true)) {
            $locale = config('app.locale');
        }

        App::setLocale($locale);

        View::share('appearance', $request->cookie('appearance') ?? 'system');
        View::share('locale', $locale);

        return $next($request);
    }
}
