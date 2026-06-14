<?php

namespace Frieren\Core\Support;

use Frieren\Core\Models\AdminUser;

class AdminPermission
{
    public const SUPER = 'SUPER';

    public static function toClientName(string $permission): string
    {
        $parts = explode('.', $permission, 2);

        if (count($parts) !== 2) {
            return strtoupper(str_replace(['.', '-'], '_', $permission));
        }

        return strtoupper($parts[1] . '_' . $parts[0]);
    }

    public static function toDatabaseName(string $permission): string
    {
        if (str_contains($permission, '.')) {
            return $permission;
        }

        $parts = explode('_', strtolower($permission), 2);

        if (count($parts) !== 2) {
            return strtolower($permission);
        }

        return $parts[1] . '.' . $parts[0];
    }

    public static function userHas(AdminUser $admin, string $permission): bool
    {
        $admin->loadMissing(['roles.permissions', 'permissions']);

        if ($admin->roles->contains('name', 'super-admin')) {
            return true;
        }

        $databasePermission = self::toDatabaseName($permission);

        if ($admin->permissions->contains('name', $databasePermission)) {
            return true;
        }

        return $admin->roles->contains(
            fn ($role) => $role->permissions->contains('name', $databasePermission)
        );
    }

    public static function userClientPermissions(AdminUser $admin): array
    {
        $admin->loadMissing(['roles.permissions', 'permissions']);

        $permissions = $admin->roles
            ->flatMap(fn ($role) => $role->permissions)
            ->merge($admin->permissions)
            ->pluck('name')
            ->unique()
            ->map(fn (string $permission) => self::toClientName($permission))
            ->values()
            ->all();

        if ($admin->roles->contains('name', 'super-admin')) {
            $permissions[] = self::SUPER;
        }

        return array_values(array_unique($permissions));
    }
}
