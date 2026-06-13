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
                var authImagePosition = window.localStorage.getItem('auth.imagePosition') === 'right' ? 'right' : 'left';

                if (appearance === 'dark' || (appearance === 'system' && prefersDark)) {
                    document.documentElement.classList.add('dark');
                }

                document.documentElement.dataset.authImagePosition = authImagePosition;
            })();
        </script>
        <style>
            .auth-visual,
            .auth-form-panel {
                transition:
                    opacity 260ms ease,
                    transform 420ms cubic-bezier(0.22, 1, 0.36, 1);
                will-change: opacity, transform;
            }

            .auth-layout-switching .auth-visual,
            .auth-layout-switching .auth-form-panel {
                opacity: 0.58;
                transform: translateX(var(--auth-switch-offset, 0)) scale(0.975);
            }

            [data-auth-image-position='left'] {
                --auth-switch-offset: -18px;
            }

            [data-auth-image-position='right'] {
                --auth-switch-offset: 18px;
            }

            #auth-layout-switch {
                transition:
                    background-color 160ms ease,
                    color 160ms ease,
                    transform 420ms cubic-bezier(0.22, 1, 0.36, 1);
            }

            #auth-layout-switch.auth-layout-switch-active {
                transform: rotate(180deg);
            }

            [data-auth-image-position='right'] .auth-visual {
                order: 2;
            }

            [data-auth-image-position='right'] .auth-form-panel {
                order: 1;
            }

            @media (min-width: 1024px) {
                [data-auth-image-position='right'] .auth-layout-grid {
                    grid-template-columns: 3fr 7fr;
                }
            }
        </style>
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
            <button
                id="auth-layout-switch"
                type="button"
                class="hidden h-9 w-9 items-center justify-center rounded-md border border-border bg-background text-sm shadow-xs outline-none transition-colors hover:bg-accent focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 lg:inline-flex"
                title="{{ __('auth_admin.switch_layout') }}"
                aria-label="{{ __('auth_admin.switch_layout') }}"
            >
                <span aria-hidden="true">⇄</span>
            </button>

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

        <main class="auth-layout-grid grid min-h-screen grid-cols-1 lg:grid-cols-[7fr_3fr]">
            <section class="auth-visual relative hidden min-h-screen overflow-hidden bg-neutral-950 lg:block">
                <img
                    id="auth-visual-image"
                    src="/logo.svg"
                    alt="{{ __('auth_admin.brand') }}"
                    class="absolute inset-0 h-full w-full object-cover"
                >
                <div class="absolute inset-0 bg-gradient-to-br from-black/45 via-black/20 to-black/60"></div>
                <div class="relative z-10 flex h-full flex-col justify-between p-10 text-white">
                    <p class="text-sm font-semibold tracking-wide">{{ __('auth_admin.brand') }}</p>
                    <div class="max-w-md">
                        <p class="text-4xl font-semibold leading-tight">@yield('heading')</p>
                        <p class="mt-4 text-sm leading-6 text-white/75">@yield('description')</p>
                    </div>
                </div>
            </section>

            <section class="auth-form-panel flex min-h-screen items-center justify-center px-4 py-24 lg:px-6 xl:px-8">
                <div class="w-full max-w-sm rounded-lg border bg-card p-6 shadow-sm">
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
                </div>
            </section>
        </main>

        <script>
            (function () {
                var authImage = window.localStorage.getItem('auth.image');
                var authImageElement = document.getElementById('auth-visual-image');
                var switchButton = document.getElementById('auth-layout-switch');

                if (authImage && authImageElement) {
                    authImageElement.setAttribute('src', authImage);
                }

                if (switchButton) {
                    switchButton.addEventListener('click', function () {
                        var currentPosition = document.documentElement.dataset.authImagePosition === 'right' ? 'right' : 'left';
                        var nextPosition = currentPosition === 'right' ? 'left' : 'right';

                        document.documentElement.classList.add('auth-layout-switching');
                        switchButton.classList.toggle('auth-layout-switch-active');

                        window.setTimeout(function () {
                            document.documentElement.dataset.authImagePosition = nextPosition;
                            window.localStorage.setItem('auth.imagePosition', nextPosition);
                            window.dispatchEvent(new Event('brand-assets-change'));
                        }, 130);

                        window.setTimeout(function () {
                            document.documentElement.classList.remove('auth-layout-switching');
                        }, 420);
                    });
                }
            })();
        </script>
        @stack('scripts')
    </body>
</html>
