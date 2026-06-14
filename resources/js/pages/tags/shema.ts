import { z } from 'zod';
import type { ResourceColumn, ResourceField } from '@/components/custom/types';

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

export const TagSchema = z.object({
    id: z.number(),
    name: z.string().nullable(),
    slug: z.string().nullable(),
    created_at: z.union([z.date(), z.string()]).nullable(),
    updated_at: z.union([z.date(), z.string()]).nullable(),
});

export const TagsSchema = z.array(TagSchema);

export const TagFormSchema = z.object({
    name: z.string().min(1, 'Name is required.'),
});

export type Tag = z.infer<typeof TagSchema>;
export type Tags = z.infer<typeof TagsSchema>;
export type TagForm = z.infer<typeof TagFormSchema>;

export type TagResponse<T> = {
    data: T;
    meta: Meta;
    links: Links;
};

export const tagConfig = {
    key: 'tags',
    title: 'Tags',
    singular: 'Tag',
    endpoint: '/api/tags',
    basePath: '/portal/tags',
    breadcrumbs: [{ title: 'Tags', href: '/portal/tags' }],
    columns: [
        { key: 'id', label: 'ID' },
        { key: 'name', label: 'Name' },
        { key: 'slug', label: 'Slug' },
    ] satisfies ResourceColumn[],
    fields: [
        { name: 'name', label: 'Name', type: 'text', required: true },
    ] satisfies ResourceField[],
};
