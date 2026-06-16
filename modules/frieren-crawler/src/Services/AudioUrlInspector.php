<?php

namespace Frieren\Crawler\Services;

use Illuminate\Support\Facades\Http;

final class AudioUrlInspector
{
    public function inspect(string $url): array
    {
        if (! filter_var($url, FILTER_VALIDATE_URL)) {
            return [
                'status' => 'invalid',
                'http_status' => null,
                'content_type' => null,
                'content_length' => null,
                'duration_seconds' => null,
                'error_message' => 'URL is not valid.',
                'metadata' => [],
            ];
        }

        try {
            $response = Http::timeout(12)
                ->withHeaders(['Range' => 'bytes=0-1024'])
                ->get($url);

            $contentType = strtolower((string) $response->header('content-type'));
            $contentLength = $response->header('content-length');
            $isAudio = str_contains($contentType, 'audio/')
                || preg_match('/\.(mp3|m4a|aac|wav|ogg|flac)(\?.*)?$/i', $url);
            $isReachable = $response->successful() || $response->status() === 206;

            return [
                'status' => $isReachable && $isAudio ? 'valid' : 'invalid',
                'http_status' => $response->status(),
                'content_type' => $contentType ?: null,
                'content_length' => is_numeric($contentLength) ? (int) $contentLength : null,
                'duration_seconds' => null,
                'error_message' => $isReachable && $isAudio ? null : 'URL is not reachable as an audio resource.',
                'metadata' => [
                    'validated_by' => 'http_range_probe',
                    'audio_extension_match' => (bool) preg_match('/\.(mp3|m4a|aac|wav|ogg|flac)(\?.*)?$/i', $url),
                ],
            ];
        } catch (\Throwable $exception) {
            return [
                'status' => 'invalid',
                'http_status' => null,
                'content_type' => null,
                'content_length' => null,
                'duration_seconds' => null,
                'error_message' => $exception->getMessage(),
                'metadata' => ['validated_by' => 'http_range_probe'],
            ];
        }
    }
}
