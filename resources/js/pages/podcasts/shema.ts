import { type ResourceConfig, type ResourceRecord } from '@/components/custom/types';

export type Podcast = ResourceRecord;
export type Podcasts = Podcast[];

export const podcastConfig: ResourceConfig = {
    key: 'podcasts',
    title: 'Podcasts',
    singular: 'Podcast',
    endpoint: '/api/podcasts',
    basePath: '/portal/podcasts',
    breadcrumbs: [{ title: 'Podcasts', href: '/portal/podcasts' }],
    columns: [
        { key: 'id', label: 'ID' },
        { key: 'title', label: 'Title' },
        { key: 'slug', label: 'Slug' },
        { key: 'publisher.name', label: 'Publisher' },
    ],
    fields: [
        { name: 'title', label: 'Title', type: 'text', required: true },
        { name: 'slug', label: 'Slug', type: 'text', required: true },
        { name: 'description', label: 'Description', type: 'textarea' },
        { name: 'content', label: 'Content', type: 'textarea' },
        { name: 'publisher_id', label: 'Publisher ID', type: 'number', required: true },
        { name: 'cover_image', label: 'Cover image', type: 'file' },
    ],
};
