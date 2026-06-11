<?php

namespace App\Http\Controllers\Admin\Auth;

use App\Http\Controllers\Controller;
use Frieren\Core\Http\Requests\StoreAdminUserRequest;
use Frieren\Core\Models\AdminUser;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredAdminController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('admin/auth/register');
    }

    public function store(StoreAdminUserRequest $request): RedirectResponse
    {
        $admin = AdminUser::create($request->validated() + ['status' => 'active']);

        Auth::guard('admin')->login($admin);

        return redirect()->intended(route('home', absolute: false));
    }
}
