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

export const CrawlerProfileSchema = z.object({
    id: z.number(),
    name: z.string().nullable(),
    key: z.string().nullable().optional(),
    driver: z.string().nullable().optional(),
    version: z.number().nullable().optional(),
});

export const CrawlerSourceSchema = z.object({
    id: z.number(),
    crawler_profile_id: z.number().nullable().optional(),
    name: z.string().nullable(),
    type: z.string().nullable(),
    base_url: z.string().nullable(),
    host: z.string().nullable(),
    status: z.string().nullable(),
    options_override: z.unknown().nullable().optional(),
    start_urls: z.array(z.string()).nullable().optional(),
    last_crawled_at: z.union([z.date(), z.string()]).nullable(),
    created_at: z.union([z.date(), z.string()]).nullable().optional(),
    updated_at: z.union([z.date(), z.string()]).nullable().optional(),
    profile: CrawlerProfileSchema.nullable().optional(),
});

export const CrawlerSourcesSchema = z.array(CrawlerSourceSchema);

export const CrawlerSourceFormSchema = z.object({
    crawler_profile_id: z.union([z.coerce.number(), z.literal(''), z.null()]).optional().transform((value) => (value === '' || value == null ? null : value)),
    name: z.string().min(1, 'Name is required.'),
    type: z.string().min(1, 'Type is required.'),
    base_url: z.string().url('Base URL must be a valid URL.'),
    status: z.enum(['active', 'paused']),
    options_override: z.string().nullable().refine((value) => {
        if (!value || !value.trim()) {
            return true;
        }

        try {
            JSON.parse(value);

            return true;
        } catch {
            return false;
        }
    }, 'Options override must be valid JSON.'),
    start_urls: z.string().nullable(),
});

export type CrawlerSource = z.infer<typeof CrawlerSourceSchema>;
export type CrawlerSources = z.infer<typeof CrawlerSourcesSchema>;
export type CrawlerSourceForm = z.infer<typeof CrawlerSourceFormSchema>;

export type CrawlerSourceResponse<T> = {
    data: T;
    meta: Meta;
    links: Links;
};

export const crawlerSourceConfig = {
    key: 'crawler-sources',
    title: 'Crawler Sources',
    singular: 'Crawler Source',
    endpoint: '/api/frieren-crawler/admin/sources',
    basePath: '/portal/crawler-sources',
    breadcrumbs: [{ title: 'Crawler Sources', href: '/portal/crawler-sources' }],
};
