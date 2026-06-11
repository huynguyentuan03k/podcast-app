import { type ResourceConfig, type ResourceRecord } from '@/components/custom/types';

export type Tag = ResourceRecord;
export type Tags = Tag[];

export const tagConfig: ResourceConfig = {
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
    ],
    fields: [{ name: 'name', label: 'Name', type: 'text', required: true }],
};
