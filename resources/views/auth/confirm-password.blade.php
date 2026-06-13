@extends('layouts.auth')

@section('title', __('auth_admin.confirm_title'))
@section('heading', __('auth_admin.confirm_heading'))
@section('description', __('auth_admin.confirm_description'))

@section('content')
    <form method="POST" action="{{ url('/confirm-password') }}" class="space-y-4">
        @csrf
        <input name="password" type="password" required autocomplete="current-password" placeholder="{{ __('auth_admin.password') }}" class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
        @error('password')
            <p class="text-sm text-destructive">{{ $message }}</p>
        @enderror
        <button type="submit" class="w-full rounded-md bg-neutral-950 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800">{{ __('auth_admin.confirm_button') }}</button>
    </form>
@endsection
