<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Symfony\Component\HttpFoundation\Response;

class SetApiLocale
{
    private array $supportedLocales = ['en', 'vi', 'ja'];

    public function handle(Request $request, Closure $next): Response
    {
        $locale = $request->query('lang')
            ?? $request->header('X-Locale')
            ?? $request->getPreferredLanguage($this->supportedLocales)
            ?? config('app.locale');

        if (! in_array($locale, $this->supportedLocales, true)) {
            $locale = config('app.locale');
        }

        App::setLocale($locale);

        return $next($request);
    }
}
