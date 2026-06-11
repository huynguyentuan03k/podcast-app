import { type ResourceConfig, type ResourceRecord } from '@/components/custom/types';

export type Author = ResourceRecord;
export type Authors = Author[];

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
