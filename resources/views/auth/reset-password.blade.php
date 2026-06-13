@extends('layouts.auth')

@section('title', __('auth_admin.reset_title'))
@section('heading', __('auth_admin.reset_heading'))
@section('description', __('auth_admin.reset_description'))

@section('content')
    <form method="POST" action="{{ route('password.store') }}" class="space-y-4">
        @csrf
        <input type="hidden" name="token" value="{{ $token }}">
        <input type="hidden" name="email" value="{{ old('email', $email) }}">
        <div>
            <label for="reset-email" class="text-sm font-medium">{{ __('auth_admin.email') }}</label>
            <input id="reset-email" type="email" value="{{ old('email', $email) }}" disabled class="mt-1 w-full cursor-not-allowed rounded-md border border-input bg-muted px-3 py-2 text-sm text-muted-foreground">
        </div>
        <input name="password" type="password" required placeholder="{{ __('auth_admin.password') }}" class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
        <input name="password_confirmation" type="password" required placeholder="{{ __('auth_admin.confirm_password_field') }}" class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
        @error('email')
            <p class="text-sm text-destructive">{{ $message }}</p>
        @enderror
        @error('password')
            <p class="text-sm text-destructive">{{ $message }}</p>
        @enderror
        <button type="submit" class="w-full rounded-md bg-neutral-950 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800">{{ __('auth_admin.reset_button') }}</button>
    </form>
@endsection
