import { type ResourceConfig } from '@/components/custom/types';
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

export const AuthorSchema = z.object({
    id: z.number(),
    name: z.string().nullable(),
    bio: z.string().nullable(),
    avatar_url: z.string().nullable(),
    email: z.string().nullable(),
    website: z.string().nullable(),
    created_at: z.union([z.date(), z.string()]).nullable(),
    updated_at: z.union([z.date(), z.string()]).nullable(),
});

export const AuthorsSchema = z.array(AuthorSchema);

export type Author = z.infer<typeof AuthorSchema>;
export type Authors = z.infer<typeof AuthorsSchema>;

export type AuthorResponse<T> = {
    data: T;
    meta: Meta;
    links: Links;
};

// AuthorForm chi dung de submit du lieu len backend
export type AuthorForm = {
    avatar: File | undefined | string;
    name: string;
    bio: string;
    email: string;
    website: string;
};

export const AuthorFormSchema = z.object({
    name: z.string().min(1, 'Name is required.'),
    bio: z.string(),
    email: z.string().email('Email must be valid.').or(z.literal('')),
    website: z.string(),
    avatar: z.custom<File | string | undefined>(),
});

export const authorConfig: ResourceConfig = {
    key: 'authors',
    title: 'Authors',
    singular: 'Author',
    endpoint: '/api/authors',
    basePath: '/portal/authors',
    breadcrumbs: [{ title: 'Authors', href: '/portal/authors' }],
    columns: [
        { key: 'id', label: 'ID' },
        { key: 'name', label: 'Name' },
        { key: 'email', label: 'Email' },
        { key: 'website', label: 'Website' },
    ],
    fields: [
        { name: 'name', label: 'Name', type: 'text', required: true },
        { name: 'bio', label: 'Bio', type: 'textarea' },
        { name: 'email', label: 'Email', type: 'text' },
        { name: 'website', label: 'Website', type: 'text' },
        { name: 'avatar', label: 'Avatar', type: 'file' },
    ],
};
