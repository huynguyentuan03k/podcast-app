<?php
return [
    'paths' => ['api/*'],
    'allowed_methods' => ['*'],
    'allowed_origins' => ['*'], // hoặc chỉ domain React của bạn
    'allowed_headers' => ['*'],
    'supports_credentials' => false,
];
