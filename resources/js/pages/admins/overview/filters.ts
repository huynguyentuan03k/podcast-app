import type { DataTableV1FacetedFilter, DataTableV1Request, DataTableV1Response } from '@/components/custom/data-table-v1';
import type { Admin } from '../shema';
import { toAdminSortParam } from './sorting';

type AdminIndexResponse = {
    data?: Admin[];
    meta?: {
        total?: number;
    };
    total?: number;
};

export const adminFacetedFilters: DataTableV1FacetedFilter[] = [
    {
        key: 'status',
        title: 'Status',
        options: [
            { label: 'Active', value: 'active' },
            { label: 'Suspended', value: 'suspended' },
        ],
    },
];

export function buildAdminIndexUrl(request: DataTableV1Request) {
    const params = new URLSearchParams({
        page: String(request.pageIndex + 1),
        per_page: String(request.pageSize),
    });

    const sort = toAdminSortParam(request.sorting);

    if (sort) params.set('sort', sort);
    if (request.search.trim()) params.set('filter[username]', request.search.trim());

    const statuses = request.filters.facets.status ?? [];
    if (statuses.length === 1) params.set('filter[status]', statuses[0]);

    return `/api/frieren-core/admin-users?${params.toString()}`;
}

export function normalizeAdminIndexResponse(json: AdminIndexResponse): DataTableV1Response<Admin> {
    return {
        data: json.data ?? [],
        total: json.meta?.total ?? json.total ?? json.data?.length ?? 0,
    };
}
