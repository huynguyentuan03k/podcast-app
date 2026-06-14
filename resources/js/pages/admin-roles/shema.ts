import { z } from 'zod';

export type Meta = {
    current_page: number;
    from: number | null;
    last_page: number;
    path: string;
    per_page: number;
    to: number | null;
    total: number;
};

export type Links = {
    first: string | null;
    last: string | null;
    prev: string | null;
    next: string | null;
};

export const AdminRoleSchema = z.object({
    id: z.number(),
    name: z.string().nullable(),
    display_name: z.string().nullable(),
    description: z.string().nullable(),
    permissions: z.array(z.string()).optional(),
    admin_users: z.array(z.object({
        id: z.number(),
        username: z.string().nullable(),
        email: z.string().nullable(),
        status: z.string().nullable().optional(),
    })).optional(),
    created_at: z.union([z.date(), z.string()]).nullable(),
    updated_at: z.union([z.date(), z.string()]).nullable(),
});

export const AdminRolesSchema = z.array(AdminRoleSchema);

export const AdminRoleFormSchema = z.object({
    name: z.string().optional(),
    display_name: z.string().min(1, 'Display name is required.'),
    description: z.string().optional(),
    permission_ids: z.array(z.number()).default([]),
});

export type AdminRole = z.infer<typeof AdminRoleSchema>;
export type AdminRoles = z.infer<typeof AdminRolesSchema>;
export type AdminRoleForm = z.infer<typeof AdminRoleFormSchema>;

export type AdminRoleResponse<T> = {
    data: T;
    meta: Meta;
    links: Links;
};

export type PermissionOption = {
    id: number;
    name: string;
    display_name: string | null;
    group_name: string | null;
};

export const adminRoleConfig = {
    key: 'admin-roles',
    title: 'Admin Roles',
    singular: 'Admin Role',
    endpoint: '/api/frieren-core/roles',
    apiPath: '/frieren-core/roles',
    basePath: '/portal/admin-roles',
    breadcrumbs: [
        { title: 'System', href: '/' },
        { title: 'Admin Roles', href: '/portal/admin-roles' },
    ],
};
