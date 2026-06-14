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

export const UserProfileSchema = z.object({
    id: z.number().nullable().optional(),
    display_name: z.string().nullable().optional(),
    phone_number: z.string().nullable().optional(),
    avatar: z.string().nullable().optional(),
    date_of_birth: z.string().nullable().optional(),
    gender: z.string().nullable().optional(),
    bio: z.string().nullable().optional(),
    locale: z.string().nullable().optional(),
    timezone: z.string().nullable().optional(),
    metadata: z.unknown().nullable().optional(),
    created_at: z.union([z.date(), z.string()]).nullable().optional(),
    updated_at: z.union([z.date(), z.string()]).nullable().optional(),
});

export const UserPreferenceSchema = z.object({
    id: z.number().nullable().optional(),
    language: z.string().nullable().optional(),
    theme: z.string().nullable().optional(),
    notification_enabled: z.boolean().nullable().optional(),
    email_notification_enabled: z.boolean().nullable().optional(),
    push_notification_enabled: z.boolean().nullable().optional(),
    autoplay_enabled: z.boolean().nullable().optional(),
    playback_speed: z.union([z.number(), z.string()]).nullable().optional(),
    metadata: z.unknown().nullable().optional(),
    created_at: z.union([z.date(), z.string()]).nullable().optional(),
    updated_at: z.union([z.date(), z.string()]).nullable().optional(),
});

export const UserDeviceSchema = z.object({
    id: z.number(),
    device_uuid: z.string().nullable(),
    platform: z.string().nullable(),
    device_name: z.string().nullable(),
    push_token: z.string().nullable(),
    app_version: z.string().nullable(),
    os_version: z.string().nullable(),
    last_seen_at: z.union([z.date(), z.string()]).nullable(),
    revoked_at: z.union([z.date(), z.string()]).nullable(),
    metadata: z.unknown().nullable().optional(),
    created_at: z.union([z.date(), z.string()]).nullable(),
    updated_at: z.union([z.date(), z.string()]).nullable(),
});

export const UserSocialAccountSchema = z.object({
    id: z.number(),
    provider: z.string().nullable(),
    provider_user_id: z.string().nullable(),
    email: z.string().nullable(),
    nickname: z.string().nullable(),
    avatar: z.string().nullable(),
    token_expires_at: z.union([z.date(), z.string()]).nullable(),
    metadata: z.unknown().nullable().optional(),
    created_at: z.union([z.date(), z.string()]).nullable(),
    updated_at: z.union([z.date(), z.string()]).nullable(),
});

export const UserSchema = z.object({
    id: z.number(),
    name: z.string().nullable(),
    email: z.string().nullable(),
    email_verified_at: z.union([z.date(), z.string()]).nullable(),
    devices_count: z.number().nullable().optional(),
    social_accounts_count: z.number().nullable().optional(),
    profile: UserProfileSchema.nullable().optional(),
    preference: UserPreferenceSchema.nullable().optional(),
    devices: z.array(UserDeviceSchema).optional(),
    social_accounts: z.array(UserSocialAccountSchema).optional(),
    created_at: z.union([z.date(), z.string()]).nullable(),
    updated_at: z.union([z.date(), z.string()]).nullable(),
});

export const UsersSchema = z.array(UserSchema);

export const UserFormSchema = z
    .object({
        name: z.string().min(1, 'Name is required.'),
        email: z.string().email('Email is invalid.'),
        password: z.string().optional(),
        password_confirmation: z.string().optional(),
        profile: z.object({
            display_name: z.string().optional(),
            phone_number: z.string().optional(),
            avatar: z.string().optional(),
            date_of_birth: z.string().optional(),
            gender: z.string().optional(),
            bio: z.string().optional(),
            locale: z.string().optional(),
            timezone: z.string().optional(),
        }),
        preference: z.object({
            language: z.string().optional(),
            theme: z.string().optional(),
            notification_enabled: z.boolean(),
            email_notification_enabled: z.boolean(),
            push_notification_enabled: z.boolean(),
            autoplay_enabled: z.boolean(),
            playback_speed: z.coerce.number().min(0.25).max(3),
        }),
    })
    .superRefine((values, ctx) => {
        if (values.password || values.password_confirmation) {
            if ((values.password?.length ?? 0) < 8) {
                ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['password'], message: 'Password must be at least 8 characters.' });
            }

            if (values.password !== values.password_confirmation) {
                ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['password_confirmation'], message: 'Password confirmation does not match.' });
            }
        }
    });

export type User = z.infer<typeof UserSchema>;
export type Users = z.infer<typeof UsersSchema>;
export type UserForm = z.infer<typeof UserFormSchema>;

export type UserResponse<T> = {
    data: T;
    meta: Meta;
    links: Links;
};

export const userConfig = {
    key: 'users',
    title: 'Users',
    singular: 'User',
    endpoint: '/api/users',
    basePath: '/portal/users',
    breadcrumbs: [{ title: 'Users', href: '/portal/users' }],
};
