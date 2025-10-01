<?php

namespace App\Services;

use App\Models\Setting;
use Illuminate\Support\Facades\Cache;
use InvalidArgumentException;

class SettingService
{
    /**
     * Get setting value by key
     *
     * @param string $key - Use SettingKey constants
     * @param mixed $default
     * @return mixed
     * @throws InvalidArgumentException
     */
    public static function get(string $key, $default = null)
    {
        // Validate key
        if (!self::isValid($key)) {
            throw new InvalidArgumentException("Invalid setting key: {$key}");
        }

        return Cache::remember("setting_{$key}", now()->addDay(), function () use ($key, $default) {
            $setting = Setting::where('key', $key)->first();

            if (!$setting) {
                return $default;
            }

            // Nếu value là JSON -> decode
            $decoded = json_decode($setting->value, true);
            return json_last_error() === JSON_ERROR_NONE ? $decoded : $setting->value;
        });
    }

    /**
     * Set setting value by key
     *
     * @param string $key - Use SettingKey constants
     * @param mixed $value - Mảng sẽ được lưu dạng JSON
     * @return Setting
     * @throws InvalidArgumentException
     */
    public static function set(string $key, $value): Setting
    {
        // Validate key
        if (!self::isValid($key)) {
            throw new InvalidArgumentException("Invalid setting key: {$key}");
        }

        // Nếu là mảng -> encode JSON
        $storeValue = is_array($value) ? json_encode($value) : $value;

        $setting = Setting::updateOrCreate(
            ['key' => $key],
            ['value' => $storeValue]
        );

        // Clear cache sau khi update
        Cache::forget("setting_{$key}");

        return $setting;
    }

    /**
     * Validate setting key
     *
     * @param string $key
     * @return bool
     */
    protected static function isValid(string $key): bool
    {
        // TODO: thay bằng logic thực tế, ví dụ check trong SettingKey::all()
        return !empty($key);
    }
}
