import { type BreadcrumbItem } from '@/types';

export type ResourceFieldType = 'text' | 'textarea' | 'number' | 'password' | 'file';

export type ResourceColumn = {
    key: string;
    label: string;
};

export type ResourceField = {
    name: string;
    label: string;
    type: ResourceFieldType;
    required?: boolean;
    createOnly?: boolean;
};

export type ResourceConfig = {
    key: string;
    title: string;
    singular: string;
    endpoint: string;
    basePath: string;
    columns: ResourceColumn[];
    fields: ResourceField[];
    breadcrumbs: BreadcrumbItem[];
};

export type ResourceRecord = Record<string, unknown> & {
    id: number;
};

export type ResourceIndexResponse = {
    data: ResourceRecord[];
    meta?: {
        current_page?: number;
        last_page?: number;
        per_page?: number;
        total?: number;
    };
};
