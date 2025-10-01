<?php

namespace App\Enums;

class SettingKey
{
    public const KEYWORD_SUGGESTION = 'keyword_suggestions';

    public static function all(): array
    {
        return [
            self::KEYWORD_SUGGESTION,
        ];
    }
}
