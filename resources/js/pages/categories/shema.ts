import { type ResourceConfig, type ResourceRecord } from '@/components/custom/types';

export type Category = ResourceRecord;
export type Categories = Category[];

export const categoryConfig: ResourceConfig = {
    key: 'categories',
    title: 'Categories',
    singular: 'Category',
    endpoint: '/api/categories',
    basePath: '/portal/categories',
    breadcrumbs: [{ title: 'Categories', href: '/portal/categories' }],
    columns: [
        { key: 'id', label: 'ID' },
        { key: 'name.en', label: 'Name EN' },
        { key: 'name.vi', label: 'Name VI' },
        { key: 'description', label: 'Description' },
    ],
    fields: [
        { name: 'name.en', label: 'Name EN', type: 'text', required: true },
        { name: 'name.vi', label: 'Name VI', type: 'text', required: true },
        { name: 'description', label: 'Description', type: 'textarea' },
    ],
};
