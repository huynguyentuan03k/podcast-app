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

export const EpisodeSchema = z.object({
    id: z.number(),
    title: z.string().nullable(),
    description: z.string().nullable(),
    slug: z.string().nullable(),
    podcast_id: z.number(),
    audio_path: z.string().nullable(),
    audio_url: z.string().nullable().optional(),
    duration: z.string().nullable().optional(),
    cover_image: z.string().nullable(),
    created_at: z.union([z.date(), z.string()]).nullable(),
    updated_at: z.union([z.date(), z.string()]).nullable(),
});

export const EpisodesSchema = z.array(EpisodeSchema);

export type Episode = z.infer<typeof EpisodeSchema>;
export type Episodes = z.infer<typeof EpisodesSchema>;

export type EpisodeResponse<T> = {
    data: T;
    meta?: Meta;
    links?: Links;
};

export type EpisodeForm = {
    title: string;
    description: string;
    slug: string;
    podcast_id: number;
    duration?: string;
    audio_path?: FileList;
    cover_image?: FileList;
};

export type PodcastOption = {
    id: number;
    title: string;
};
