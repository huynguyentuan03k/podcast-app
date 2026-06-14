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

export const EpisodePodcastSchema = z.object({
    id: z.number(),
    title: z.string().nullable(),
});

export const EpisodeSchema = z.object({
    id: z.number(),
    title: z.string().nullable(),
    description: z.string().nullable(),
    slug: z.string().nullable(),
    podcast_id: z.number(),
    podcast: EpisodePodcastSchema.nullable().optional(),
    audio_path: z.string().nullable(),
    audio_url: z.string().nullable().optional(),
    duration: z.union([z.string(), z.number()]).nullable().optional(),
    cover_image: z.string().nullable(),
    created_at: z.union([z.date(), z.string()]).nullable(),
    updated_at: z.union([z.date(), z.string()]).nullable(),
});

export const EpisodesSchema = z.array(EpisodeSchema);

export const EpisodeFormSchema = z.object({
    title: z.string().min(1, 'Title is required.'),
    description: z.string().nullable(),
    slug: z.string().min(1, 'Slug is required.'),
    podcast_id: z.coerce.number().min(1, 'Podcast is required.'),
    audio_path: z.string().url('Audio URL must be valid.'),
    duration: z.string().nullable(),
});

export type Episode = z.infer<typeof EpisodeSchema>;
export type Episodes = z.infer<typeof EpisodesSchema>;
export type EpisodeForm = z.infer<typeof EpisodeFormSchema>;

export type EpisodeResponse<T> = {
    data: T;
    meta?: Meta;
    links?: Links;
};

export type PodcastOption = {
    id: number;
    title: string | null;
};

export const episodeConfig = {
    key: 'episodes',
    title: 'Episodes',
    singular: 'Episode',
    endpoint: '/api/episodes',
    basePath: '/portal/episodes',
    breadcrumbs: [{ title: 'Episodes', href: '/portal/episodes' }],
};
