<?php

return [
    'default_language' => env('PODCAST_DEFAULT_LANGUAGE', 'vi'),

    'supported_languages' => [
        'vi' => [
            'native_name' => 'Tieng Viet',
            'english_name' => 'Vietnamese',
        ],
        'en' => [
            'native_name' => 'English',
            'english_name' => 'English',
        ],
        'ja' => [
            'native_name' => 'Nihongo',
            'english_name' => 'Japanese',
        ],
    ],
];
