import type { route as routeFn } from 'ziggy-js';

declare global {
    const route: typeof routeFn;
    interface Window {
        appSettings?: {
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
    }
}
