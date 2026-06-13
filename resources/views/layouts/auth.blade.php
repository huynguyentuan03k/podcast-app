<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" @class(['dark' => ($appearance ?? 'system') === 'dark'])>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">
        <title>@yield('title', __('auth_admin.brand'))</title>
        <script>
            (function () {
                var appearance = @json($appearance ?? 'system');
                var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

                if (appearance === 'dark' || (appearance === 'system' && prefersDark)) {
                    document.documentElement.classList.add('dark');
                }
            })();
        </script>
        @vite(['resources/css/app.css'])
    </head>
    <body class="min-h-screen bg-background font-sans text-foreground antialiased">
        @php
            $currentLocale = $locale ?? app()->getLocale();
            $currentAppearance = $appearance ?? 'system';
            $locales = [
                'en' => __('auth_admin.english'),
                'vi' => __('auth_admin.vietnamese'),
                'ja' => __('auth_admin.japanese'),
            ];
            $themes = [
                'light' => __('auth_admin.light'),
                'dark' => __('auth_admin.dark'),
                'system' => __('auth_admin.system'),
            ];
        @endphp

        <div class="fixed top-4 right-4 z-20 flex flex-wrap items-center justify-end gap-2">
            <form method="POST" action="{{ route('auth.preferences') }}">
                @csrf
                <label for="auth-locale" class="sr-only">{{ __('auth_admin.language') }}</label>
                <select
                    id="auth-locale"
                    name="locale"
                    onchange="this.form.submit()"
                    class="h-9 rounded-md border border-border bg-background px-3 text-sm shadow-xs outline-none transition-colors hover:bg-accent focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                >
                    @foreach ($locales as $value => $label)
                        <option value="{{ $value }}" @selected($currentLocale === $value)>{{ $label }}</option>
                    @endforeach
                </select>
            </form>

            <form method="POST" action="{{ route('auth.preferences') }}">
                @csrf
                <label for="auth-appearance" class="sr-only">{{ __('auth_admin.theme') }}</label>
                <select
                    id="auth-appearance"
                    name="appearance"
                    onchange="this.form.submit()"
                    class="h-9 rounded-md border border-border bg-background px-3 text-sm shadow-xs outline-none transition-colors hover:bg-accent focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                >
                    @foreach ($themes as $value => $label)
                        <option
                            value="{{ $value }}"
                            @selected($currentAppearance === $value)
                        >
                            {{ $label }}
                        </option>
                    @endforeach
                </select>
            </form>
        </div>

        <main class="flex min-h-screen items-center justify-center px-4 py-20">
            <section class="w-full max-w-md rounded-lg border bg-card p-6 shadow-sm">
                <p class="mb-5 text-sm font-semibold text-muted-foreground">{{ __('auth_admin.brand') }}</p>
                <h1 class="text-2xl font-semibold">@yield('heading')</h1>
                <p class="mt-2 text-sm text-muted-foreground">@yield('description')</p>

                @if (session('status'))
                    <div class="mt-4 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                        {{ session('status') }}
                    </div>
                @endif

                <div class="mt-6">
                    @yield('content')
                </div>
            </section>
        </main>

        @stack('scripts')
    </body>
</html>
