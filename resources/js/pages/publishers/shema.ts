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

export const PublisherSchema = z.object({
    id: z.number(),
    name: z.string().nullable(),
    description: z.string().nullable().optional(),
    website: z.string().nullable(),
    email: z.string().nullable(),
    address: z.string().nullable(),
    phone: z.string().nullable(),
    established_year: z.number().nullable(),
    slug: z.string().nullable().optional(),
    created_at: z.union([z.date(), z.string()]).nullable(),
    updated_at: z.union([z.date(), z.string()]).nullable(),
});

export const PublishersSchema = z.array(PublisherSchema);

export const PublisherFormSchema = z.object({
    name: z.string().min(1, 'Name is required.'),
    email: z.string().email('Email must be valid.'),
    phone: z.string().min(1, 'Phone is required.'),
    address: z.string().nullable(),
    website: z.string().nullable(),
    established_year: z.coerce.number().min(1800, 'Established year must be 1800 or later.'),
});

export type Publisher = z.infer<typeof PublisherSchema>;
export type Publishers = z.infer<typeof PublishersSchema>;
export type PublisherForm = z.infer<typeof PublisherFormSchema>;

export type PublisherResponse<T> = {
    data: T;
    meta: Meta;
    links: Links;
};

export const publisherConfig = {
    key: 'publishers',
    title: 'Publishers',
    singular: 'Publisher',
    endpoint: '/api/publishers',
    basePath: '/portal/publishers',
    breadcrumbs: [{ title: 'Publishers', href: '/portal/publishers' }],
};
