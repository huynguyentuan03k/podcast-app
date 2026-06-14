<?php

namespace Frieren\Integrate\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

final class VerifyIntegrationToken
{
    public function handle(Request $request, Closure $next): Response
    {
        $expected = (string) config('integrate.api.token');
        $provided = (string) $request->bearerToken();

        if ($expected === '' || $provided === '' || !hash_equals($expected, $provided)) {
            abort(401, 'Invalid integration token.');
        }

        $maxBytes = ((int) config('integrate.api.max_payload_kb', 1024)) * 1024;
        if ((int) $request->server('CONTENT_LENGTH', 0) > $maxBytes) {
            abort(413, 'Payload too large.');
        }

        return $next($request);
    }
}
