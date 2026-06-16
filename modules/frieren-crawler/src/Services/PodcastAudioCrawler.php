<?php

namespace Frieren\Crawler\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

final class PodcastAudioCrawler
{
    public function collectFromUrl(string $sourceUrl): array
    {
        $html = Http::timeout(20)->get($sourceUrl)->throw()->body();
        $urls = [];

        preg_match_all('/(?:href|src)=["\']([^"\']+)["\']/i', $html, $matches);

        foreach ($matches[1] ?? [] as $candidate) {
            $absoluteUrl = $this->toAbsoluteUrl($candidate, $sourceUrl);

            if ($this->looksLikeAudioUrl($absoluteUrl)) {
                $urls[] = $absoluteUrl;
            }
        }

        preg_match_all('/https?:\/\/[^\s"\']+\.(?:mp3|m4a|aac|wav|ogg|flac)(?:\?[^\s"\']*)?/i', $html, $inlineMatches);
        $urls = array_merge($urls, $inlineMatches[0] ?? []);

        return array_values(array_unique($urls));
    }

    public function normalizeRawUrls(string|array|null $rawUrls): array
    {
        if ($rawUrls === null) {
            return [];
        }

        $items = is_array($rawUrls) ? $rawUrls : preg_split('/\R+/', $rawUrls);

        return collect($items)
            ->map(fn ($url) => trim((string) $url))
            ->filter(fn ($url) => $url !== '' && $this->looksLikeAudioUrl($url))
            ->unique()
            ->values()
            ->all();
    }

    public function titleFromUrl(string $url, string $fallback): string
    {
        $path = parse_url($url, PHP_URL_PATH) ?: '';
        $filename = pathinfo($path, PATHINFO_FILENAME);
        $title = trim(str_replace(['-', '_', '.'], ' ', urldecode($filename)));

        return $title !== '' ? Str::title($title) : $fallback;
    }

    private function looksLikeAudioUrl(string $url): bool
    {
        return (bool) preg_match('/^https?:\/\/.+\.(mp3|m4a|aac|wav|ogg|flac)(\?.*)?$/i', $url);
    }

    private function toAbsoluteUrl(string $url, string $baseUrl): string
    {
        if (str_starts_with($url, 'http://') || str_starts_with($url, 'https://')) {
            return $url;
        }

        if (str_starts_with($url, '//')) {
            return parse_url($baseUrl, PHP_URL_SCHEME) . ':' . $url;
        }

        $scheme = parse_url($baseUrl, PHP_URL_SCHEME);
        $host = parse_url($baseUrl, PHP_URL_HOST);

        if (! $scheme || ! $host) {
            return $url;
        }

        return $scheme . '://' . $host . '/' . ltrim($url, '/');
    }
}
