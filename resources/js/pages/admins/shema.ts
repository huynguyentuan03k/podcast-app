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

export const AdminSchema = z.object({
    id: z.number(),
    username: z.string().nullable(),
    email: z.string().nullable(),
    status: z.enum(['active', 'suspended']).nullable(),
    roles: z.array(z.string()).optional(),
    permissions: z.array(z.string()).optional(),
    created_at: z.union([z.date(), z.string()]).nullable(),
    updated_at: z.union([z.date(), z.string()]).nullable(),
});

export const AdminsSchema = z.array(AdminSchema);

export const AdminFormSchema = z
    .object({
        username: z.string().min(1, 'Username is required.'),
        email: z.string().email('Please enter a valid email.'),
        status: z.enum(['active', 'suspended']),
        password: z.string().optional(),
        password_confirmation: z.string().optional(),
        role_ids: z.array(z.number()).default([]),
    })
    .superRefine((value, context) => {
        const hasPassword = Boolean(value.password?.trim() || value.password_confirmation?.trim());

        if (hasPassword && (value.password?.length ?? 0) < 8) {
            context.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['password'],
                message: 'Password must be at least 8 characters.',
            });
        }

        if (value.password !== value.password_confirmation) {
            context.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['password_confirmation'],
                message: 'Password confirmation does not match.',
            });
        }
    });

export type Admin = z.infer<typeof AdminSchema>;
export type Admins = z.infer<typeof AdminsSchema>;
export type AdminForm = z.infer<typeof AdminFormSchema>;

export type AdminResponse<T> = {
    data: T;
    meta: Meta;
    links: Links;
};

export type RoleOption = {
    id: number;
    name: string;
    display_name: string | null;
};

export const adminConfig = {
    key: 'admins',
    title: 'Admins',
    singular: 'Admin',
    endpoint: '/api/frieren-core/admin-users',
    apiPath: '/frieren-core/admin-users',
    basePath: '/portal/admins',
    breadcrumbs: [
        { title: 'System', href: '/' },
        { title: 'Admins', href: '/portal/admins' },
    ],
};
