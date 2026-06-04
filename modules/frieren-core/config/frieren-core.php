<?php

return [
    'guard' => env('FRIEREN_CORE_GUARD', 'web'),
    'password_reset_table' => 'admin_password_reset_tokens',
    'tables' => [
        'users_admin' => 'users_admin',
        'admin_profiles' => 'admin_profiles',
        'roles' => 'roles',
        'permissions' => 'permissions',
        'role_has_permissions' => 'role_has_permissions',
        'user_admin_has_roles' => 'user_admin_has_roles',
        'user_admin_has_permissions' => 'user_admin_has_permissions',
    ],
];
