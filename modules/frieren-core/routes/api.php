<?php

use Frieren\Core\Http\Controllers\AdminProfileController;
use Frieren\Core\Http\Controllers\AdminUserController;
use Frieren\Core\Http\Controllers\PermissionController;
use Frieren\Core\Http\Controllers\RoleController;
use Illuminate\Auth\Middleware\Authenticate;
use Illuminate\Support\Facades\Route;

Route::prefix('api/frieren-core')->middleware('web')->group(function () {
    Route::middleware(Authenticate::using('admin'))->group(function () {
        Route::apiResource('admin-users', AdminUserController::class)->parameters(['admin-users' => 'adminUser']);
        Route::apiResource('admin-profiles', AdminProfileController::class)->parameters(['admin-profiles' => 'adminProfile']);
        Route::apiResource('roles', RoleController::class);
        Route::apiResource('permissions', PermissionController::class);

        Route::post('roles/{role}/permissions', [RoleController::class, 'syncPermissions']);
        Route::post('admin-users/{adminUser}/roles', [AdminUserController::class, 'syncRoles']);
        Route::post('admin-users/{adminUser}/permissions', [AdminUserController::class, 'syncPermissions']);
    });
});
