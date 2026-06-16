<?php

namespace App\Http\Middleware;

use Closure;
use Frieren\Core\Models\AdminUser;
use Frieren\Core\Support\AdminPermission;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureAdminPermission
{
    public function handle(Request $request, Closure $next, string $permission): Response
    {
        $admin = auth('admin')->user();

        if (! $admin instanceof AdminUser || ! AdminPermission::userHas($admin, $permission)) {
            abort(403, 'This action is unauthorized.');
        }

        return $next($request);
    }
}
