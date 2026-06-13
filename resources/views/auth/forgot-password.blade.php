@extends('layouts.auth')

@section('title', __('auth_admin.forgot_title'))
@section('heading', __('auth_admin.forgot_heading'))
@section('description', __('auth_admin.forgot_description'))

@section('content')
    <form id="forgot-password-form" method="POST" action="{{ route('password.email') }}" class="space-y-4">
        @csrf
        <label for="email" class="text-sm font-medium">{{ __('auth_admin.email') }}</label>
        <input id="email" name="email" type="email" value="{{ old('email') }}" required autofocus class="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
        @error('email')
            <p class="text-sm text-destructive">{{ $message }}</p>
        @enderror

        @if (config('services.recaptcha.site_key'))
            <input id="recaptcha-token" type="hidden" name="g-recaptcha-response">
            <input type="hidden" name="recaptcha_action" value="forgot_password">
            @error('g-recaptcha-response')
                <p class="text-sm text-destructive">{{ $message }}</p>
            @enderror
        @endif

        <button
            id="forgot-password-submit"
            type="submit"
            data-pending-label="{{ __('auth_admin.sending_reset_link') }}"
            class="w-full rounded-md bg-neutral-950 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-70"
        >
            <span class="inline-flex items-center justify-center gap-2">
                <span id="forgot-password-spinner" class="hidden size-4 animate-spin rounded-full border-2 border-white/40 border-t-white"></span>
                <span id="forgot-password-submit-label">{{ __('auth_admin.send_reset_link') }}</span>
            </span>
        </button>
        <a href="{{ route('login') }}" class="block text-center text-sm font-medium text-primary hover:underline">{{ __('auth_admin.back_to_login') }}</a>
    </form>
@endsection

@if (config('services.recaptcha.site_key'))
    @push('scripts')
        <script src="https://www.google.com/recaptcha/api.js?render={{ config('services.recaptcha.site_key') }}"></script>
        <script>
            document.getElementById('forgot-password-form').addEventListener('submit', function (event) {
                var form = this;
                var tokenInput = document.getElementById('recaptcha-token');
                var submitButton = document.getElementById('forgot-password-submit');
                var submitLabel = document.getElementById('forgot-password-submit-label');
                var spinner = document.getElementById('forgot-password-spinner');

                function setPending() {
                    submitButton.disabled = true;
                    submitLabel.textContent = submitButton.dataset.pendingLabel;
                    spinner.classList.remove('hidden');
                }

                function resetPending() {
                    submitButton.disabled = false;
                    submitLabel.textContent = @json(__('auth_admin.send_reset_link'));
                    spinner.classList.add('hidden');
                }

                if (tokenInput.value) {
                    setPending();
                    return;
                }

                event.preventDefault();
                setPending();

                grecaptcha.ready(function () {
                    grecaptcha.execute(@json(config('services.recaptcha.site_key')), { action: 'forgot_password' }).then(function (token) {
                        tokenInput.value = token;
                        form.submit();
                    }).catch(function () {
                        resetPending();
                    });
                });
            });
        </script>
    @endpush
@endif
