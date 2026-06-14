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
                profile?: {
                    id: number;
                    user_admin_id: number;
                    employee_code?: string | null;
                    first_name?: string | null;
                    last_name?: string | null;
                    phone_number?: string | null;
                    avatar?: string | null;
                    department?: string | null;
                    metadata?: unknown;
                } | null;
            } | null;
        };
    }
}
