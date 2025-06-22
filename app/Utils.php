<?php

namespace App;

class Utils
{
    /**
     * Escape ký tự đặc biệt trong LIKE query của SQL (%, _, \)
     */
    public static function escapeLike(string $value, string $char = '\\'): string
    {
        return str_replace(
            [$char, '%', '_'],
            [$char.$char, $char.'%', $char.'_'],
            $value
        );
    }
}
