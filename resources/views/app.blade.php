<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" @class(['dark' => ($appearance ?? 'system') == 'dark'])>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">

        {{-- Inline script to detect system dark mode preference and apply it immediately --}}
        <script>
            (function() {
                const appearance = '{{ $appearance ?? "system" }}';

                if (appearance === 'system') {
                    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

                    if (prefersDark) {
                        document.documentElement.classList.add('dark');
                    }
                }
            })();
        </script>

        @php
            $admin = auth('admin')->user();
            $permissions = class_exists(\Frieren\Core\Models\Permission::class)
                ? \Frieren\Core\Models\Permission::query()->orderBy('group_name')->orderBy('name')->get()
                : collect();
            $permissionGroups = $permissions
                ->groupBy('group_name')
                ->map(fn ($items) => $items->pluck('name')->map(fn ($permission) => \Frieren\Core\Support\AdminPermission::toClientName($permission))->values())
                ->toArray();
            $clientPermissions = $permissions
                ->pluck('name')
                ->merge(['dashboard.view'])
                ->map(fn ($permission) => \Frieren\Core\Support\AdminPermission::toClientName($permission))
                ->unique()
                ->values()
                ->all();
            $currentAdminPermissions = $admin instanceof \Frieren\Core\Models\AdminUser
                ? \Frieren\Core\Support\AdminPermission::userClientPermissions($admin)
                : [];
            $currentAdminProfile = $admin instanceof \Frieren\Core\Models\AdminUser
                ? optional($admin->loadMissing('profile'))->profile
                : null;
            $appSettings = [
                'permissions' => $clientPermissions,
                'permissionGroups' => $permissionGroups,
                'superPermission' => \Frieren\Core\Support\AdminPermission::SUPER,
                'currentAdmin' => $admin ? [
                    'id' => $admin->id,
                    'username' => $admin->username,
                    'email' => $admin->email,
                    'permissions' => $currentAdminPermissions,
                    'profile' => $currentAdminProfile ? [
                        'id' => $currentAdminProfile->id,
                        'user_admin_id' => $currentAdminProfile->user_admin_id,
                        'employee_code' => $currentAdminProfile->employee_code,
                        'first_name' => $currentAdminProfile->first_name,
                        'last_name' => $currentAdminProfile->last_name,
                        'phone_number' => $currentAdminProfile->phone_number,
                        'avatar' => $currentAdminProfile->avatar,
                        'department' => $currentAdminProfile->department,
                        'metadata' => $currentAdminProfile->metadata,
                    ] : null,
                ] : null,
            ];
        @endphp

        <script>
            window.appSettings = @json($appSettings);
        </script>

        {{-- Inline style to set the HTML background color based on our theme in app.css --}}
        <style>
            html {
                background-color: oklch(1 0 0);
            }

            html.dark {
                background-color: oklch(0.145 0 0);
            }
        </style>

        <title>{{ config('app.name', 'Laravel') }}</title>

        <link rel="icon" href="/favicon.ico" sizes="any">
        <link rel="icon" href="/favicon.svg" type="image/svg+xml">
        <link rel="apple-touch-icon" href="/apple-touch-icon.png">

        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />

        @viteReactRefresh
        @vite(['resources/js/main.tsx'])
    </head>
    <body class="font-sans antialiased">
        <div id="root"></div>
    </body>
</html>
