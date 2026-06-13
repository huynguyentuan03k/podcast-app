@extends('layouts.auth')

@section('title', __('auth_admin.login_title'))
@section('heading', __('auth_admin.login_heading'))
@section('description', __('auth_admin.login_description'))

@section('content')
    <form method="POST" action="{{ route('login') }}" class="space-y-4">
        @csrf
        <div>
            <label for="email" class="text-sm font-medium">{{ __('auth_admin.email') }}</label>
            <input id="email" name="email" type="email" value="{{ old('email') }}" required autofocus autocomplete="email" class="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
            @error('email')
                <p class="mt-1 text-sm text-destructive">{{ $message }}</p>
            @enderror
        </div>

        <div>
            <div class="flex items-center justify-between">
                <label for="password" class="text-sm font-medium">{{ __('auth_admin.password') }}</label>
                @if ($canResetPassword)
                    <a href="{{ route('password.request') }}" class="text-sm font-medium text-primary hover:underline">{{ __('auth_admin.forgot_password') }}</a>
                @endif
            </div>
            <input id="password" name="password" type="password" required autocomplete="current-password" class="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
            @error('password')
                <p class="mt-1 text-sm text-destructive">{{ $message }}</p>
            @enderror
        </div>

        <label class="flex items-center gap-2 text-sm">
            <input type="checkbox" name="remember" value="1">
            {{ __('auth_admin.remember_me') }}
        </label>

        <button type="submit" class="w-full rounded-md bg-neutral-950 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800">
            {{ __('auth_admin.login_button') }}
        </button>
    </form>
@endsection
