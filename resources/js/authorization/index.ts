type AppSettings = {
    permissions: string[];
    permissionGroups: Record<string, string[]>;
    superPermission: string;
    currentAdmin?: {
        id: number;
        username: string;
        email: string;
        permissions: string[];
    } | null;
};

const appSettings: AppSettings = window.appSettings ?? {
    permissions: [],
    permissionGroups: {},
    superPermission: 'SUPER',
    currentAdmin: null,
};

export const appPermissions = appSettings.permissions;
export const appPermissionGroups = appSettings.permissionGroups;
export const superPermission = appSettings.superPermission;

export function authorizeCheck(permission: string) {
    if (permission === 'ANY') return true;

    if (!appPermissions.includes(permission)) {
        throw new Error(`Permission ${permission} doesn't exist in the app, please check again`);
    }

    const permissions = appSettings.currentAdmin?.permissions ?? [];

    return permissions.includes(permission) || permissions.includes(superPermission);
}

export function authorizeCheckPermissions(permissions: string[], hasAny = false) {
    const userPermissions = appSettings.currentAdmin?.permissions ?? [];

    if (userPermissions.includes(superPermission)) {
        return true;
    }

    return hasAny
        ? permissions.some((permission) => userPermissions.includes(permission))
        : permissions.every((permission) => userPermissions.includes(permission));
}

export function useAuthorize(permission: string): {
    isAuthorized: boolean;
    allPermissions: string[];
} {
    return {
        isAuthorized: authorizeCheck(permission),
        allPermissions: appPermissions,
    };
}
