<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Lang;
use Symfony\Component\HttpFoundation\Response;

class TranslateApiResponse
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        if (! $response instanceof JsonResponse) {
            return $response;
        }

        $data = $response->getData(true);
        $response->setData($this->translateArray($data, app()->getLocale()));

        return $response;
    }

    private function translateArray(array $data, string $locale): array
    {
        foreach ($data as $key => $value) {
            if (is_array($value)) {
                $data[$key] = $this->translateArray($value, $locale);
                continue;
            }

            if (! is_string($value)) {
                continue;
            }

            $translationKey = $this->resolveTranslationKey($value);

            if ($translationKey) {
                $data[$key] = Lang::get($translationKey, [], $locale);
            }
        }

        return $data;
    }

    private function resolveTranslationKey(string $message): ?string
    {
        $catalog = config('api-messages.catalog', []);

        foreach ($catalog as $key => $sourceMessage) {
            if ($sourceMessage === $message) {
                return 'api.' . $key;
            }
        }

        return null;
    }
}
