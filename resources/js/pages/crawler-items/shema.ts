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

export const CrawlerSourceSummarySchema = z.object({
    id: z.number(),
    name: z.string().nullable(),
    type: z.string().nullable(),
    base_url: z.string().nullable().optional(),
    url: z.string().nullable().optional(),
    host: z.string().nullable().optional(),
});

export const CrawlerPodcastSummarySchema = z.object({
    id: z.number(),
    title: z.string().nullable(),
    slug: z.string().nullable().optional(),
});

export const CrawlerItemAudioSchema = z.object({
    id: z.number(),
    title: z.string().nullable(),
    position: z.number().nullable(),
    audio_url: z.string(),
    http_status: z.number().nullable(),
    content_type: z.string().nullable(),
    content_length: z.number().nullable(),
    duration_seconds: z.number().nullable(),
    status: z.string(),
    error_message: z.string().nullable(),
    last_crawled_at: z.union([z.date(), z.string()]).nullable(),
    created_at: z.union([z.date(), z.string()]).nullable(),
    episode: CrawlerPodcastSummarySchema.nullable().optional(),
});

export const CrawlerItemSchema = z.object({
    id: z.number(),
    item_type: z.string().nullable().optional(),
    external_id: z.string().nullable().optional(),
    title: z.string().nullable(),
    normalized_title: z.string().nullable().optional(),
    slug: z.string().nullable().optional(),
    source_url: z.string(),
    canonical_url: z.string().nullable(),
    description: z.string().nullable(),
    thumbnail_url: z.string().nullable(),
    status: z.string(),
    audio_count: z.number(),
    audios_count: z.number().nullable().optional(),
    assets_count: z.number().nullable().optional(),
    crawl_count: z.number(),
    failure_count: z.number(),
    metadata: z.unknown().nullable(),
    error_message: z.string().nullable(),
    first_discovered_at: z.union([z.date(), z.string()]).nullable(),
    last_crawled_at: z.union([z.date(), z.string()]).nullable(),
    last_changed_at: z.union([z.date(), z.string()]).nullable(),
    imported_at: z.union([z.date(), z.string()]).nullable(),
    created_at: z.union([z.date(), z.string()]).nullable(),
    updated_at: z.union([z.date(), z.string()]).nullable(),
    source: CrawlerSourceSummarySchema.nullable().optional(),
    podcast: CrawlerPodcastSummarySchema.nullable().optional(),
    audios: z.array(CrawlerItemAudioSchema).optional(),
});

export const CrawlerItemsSchema = z.array(CrawlerItemSchema);
export const CrawlerItemAudiosSchema = z.array(CrawlerItemAudioSchema);

export const CrawlerItemFormSchema = z.object({
    crawler_source_id: z.coerce.number().min(1, 'Crawler source is required.'),
    podcast_id: z.coerce.number().nullable().optional(),
    item_type: z.string().min(1, 'Item type is required.'),
    external_id: z.string().nullable(),
    title: z.string().nullable(),
    slug: z.string().nullable(),
    source_url: z.string().url('Source URL must be a valid URL.'),
    canonical_url: z.string().nullable(),
    description: z.string().nullable(),
    thumbnail_url: z.string().nullable(),
    status: z.string().min(1, 'Status is required.'),
    metadata: z.string().nullable(),
    error_message: z.string().nullable(),
});

export type CrawlerItem = z.infer<typeof CrawlerItemSchema>;
export type CrawlerItems = z.infer<typeof CrawlerItemsSchema>;
export type CrawlerItemAudio = z.infer<typeof CrawlerItemAudioSchema>;
export type CrawlerItemAudios = z.infer<typeof CrawlerItemAudiosSchema>;
export type CrawlerItemForm = z.infer<typeof CrawlerItemFormSchema>;

export type CrawlerItemResponse<T> = {
    data: T;
    meta: Meta;
    links: Links;
};

export const crawlerItemConfig = {
    key: 'crawler-items',
    title: 'Crawler Items',
    singular: 'Crawler Item',
    endpoint: '/api/frieren-crawler/admin/items',
    basePath: '/portal/crawler-items',
    breadcrumbs: [{ title: 'Crawler Items', href: '/portal/crawler-items' }],
};
