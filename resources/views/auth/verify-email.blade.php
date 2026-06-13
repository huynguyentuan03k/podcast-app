@extends('layouts.auth')

@section('title', __('auth_admin.verify_title'))
@section('heading', __('auth_admin.verify_heading'))
@section('description', __('auth_admin.verify_description'))

@section('content')
    <div class="space-y-4">
        <form method="POST" action="{{ route('verification.send') }}">
            @csrf
            <button type="submit" class="w-full rounded-md bg-neutral-950 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800">{{ __('auth_admin.resend_verification') }}</button>
        </form>
        <form method="POST" action="{{ route('logout') }}">
            @csrf
            <button type="submit" class="w-full rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-accent">{{ __('auth_admin.logout') }}</button>
        </form>
    </div>
@endsection
