import { type ResourceConfig, type ResourceRecord } from '@/components/custom/types';

export type Publisher = ResourceRecord;
export type Publishers = Publisher[];

export const publisherConfig: ResourceConfig = {
    key: 'publishers',
    title: 'Publishers',
    singular: 'Publisher',
    endpoint: '/api/publishers',
    basePath: '/portal/publishers',
    breadcrumbs: [{ title: 'Publishers', href: '/portal/publishers' }],
    columns: [
        { key: 'id', label: 'ID' },
        { key: 'name', label: 'Name' },
        { key: 'email', label: 'Email' },
        { key: 'phone', label: 'Phone' },
    ],
    fields: [
        { name: 'name', label: 'Name', type: 'text', required: true },
        { name: 'address', label: 'Address', type: 'text' },
        { name: 'email', label: 'Email', type: 'text', required: true },
        { name: 'website', label: 'Website', type: 'text' },
        { name: 'phone', label: 'Phone', type: 'text', required: true },
        { name: 'established_year', label: 'Established year', type: 'number', required: true },
    ],
};
