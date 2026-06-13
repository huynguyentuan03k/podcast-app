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

export const PodcastPublisherSchema = z.object({
    id: z.number(),
    name: z.string().nullable(),
});

export const PodcastAuthorSchema = z.object({
    id: z.number(),
    name: z.string().nullable(),
});

export const PodcastCategorySchema = z.object({
    id: z.number(),
    name: z.object({
        en: z.string().nullable(),
        vi: z.string().nullable(),
    }),
});

export const PodcastSchema = z.object({
    id: z.number(),
    title: z.string().nullable(),
    slug: z.string().nullable(),
    description: z.string().nullable(),
    content: z.string().nullable(),
    cover_image: z.string().nullable(),
    cover_url: z.string().nullable(),
    publisher: PodcastPublisherSchema.nullable().optional(),
    authors: z.array(PodcastAuthorSchema).optional(),
    categories: z.array(PodcastCategorySchema).optional(),
    episodes_count: z.number().nullable().optional(),
    created_at: z.union([z.date(), z.string()]).nullable(),
    updated_at: z.union([z.date(), z.string()]).nullable(),
});

export const PodcastsSchema = z.array(PodcastSchema);

export const PodcastFormSchema = z.object({
    title: z.string().min(1, 'Title is required.'),
    slug: z.string().min(1, 'Slug is required.'),
    publisher_id: z.coerce.number().min(1, 'Publisher is required.'),
    description: z.string().nullable(),
    content: z.string().nullable(),
    cover_image: z.custom<File | string | undefined>().optional(),
    author_ids: z.array(z.number()),
    category_ids: z.array(z.number()),
});

export type Podcast = z.infer<typeof PodcastSchema>;
export type Podcasts = z.infer<typeof PodcastsSchema>;
export type PodcastForm = z.infer<typeof PodcastFormSchema>;

export type PodcastResponse<T> = {
    data: T;
    meta: Meta;
    links: Links;
};

export const podcastConfig = {
    key: 'podcasts',
    title: 'Podcasts',
    singular: 'Podcast',
    endpoint: '/api/podcasts',
    basePath: '/portal/podcasts',
    breadcrumbs: [{ title: 'Podcasts', href: '/portal/podcasts' }],
};
