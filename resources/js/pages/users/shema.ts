import { type ResourceConfig, type ResourceRecord } from '@/components/custom/types';

export type UserRecord = ResourceRecord;
export type Users = UserRecord[];

export const userConfig: ResourceConfig = {
    key: 'users',
    title: 'Users',
    singular: 'User',
    endpoint: '/api/users',
    basePath: '/portal/users',
    breadcrumbs: [
        { title: 'System', href: '/' },
        { title: 'Users', href: '/portal/users' },
    ],
    columns: [
        { key: 'id', label: 'ID' },
        { key: 'name', label: 'Name' },
        { key: 'email', label: 'Email' },
        { key: 'email_verified_at', label: 'Verified at' },
    ],
    fields: [
        { name: 'name', label: 'Name', type: 'text', required: true },
        { name: 'email', label: 'Email', type: 'text', required: true },
        { name: 'password', label: 'Password', type: 'password' },
        { name: 'password_confirmation', label: 'Confirm password', type: 'password' },
    ],
};
