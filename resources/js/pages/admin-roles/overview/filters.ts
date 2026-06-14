import type { DataTableV1FacetedFilter, DataTableV1Request, DataTableV1Response } from '@/components/custom/data-table-v1';
import type { AdminRole } from '../shema';
import { toAdminRoleSortParam } from './sorting';

type AdminRoleIndexResponse = {
    data?: AdminRole[];
    meta?: {
        total?: number;
    };
    total?: number;
};

export const adminRoleFacetedFilters: DataTableV1FacetedFilter[] = [
    {
        key: 'name',
        title: 'Name',
        searchPlaceholder: 'Role name',
    },
];

export function buildAdminRoleIndexUrl(request: DataTableV1Request) {
    const params = new URLSearchParams({
        page: String(request.pageIndex + 1),
        per_page: String(request.pageSize),
    });

    const sort = toAdminRoleSortParam(request.sorting);

    if (sort) params.set('sort', sort);
    if (request.search.trim()) params.set('filter[name]', request.search.trim());

    return `/api/frieren-core/roles?${params.toString()}`;
}

export function normalizeAdminRoleIndexResponse(json: AdminRoleIndexResponse): DataTableV1Response<AdminRole> {
    return {
        data: json.data ?? [],
        total: json.meta?.total ?? json.total ?? json.data?.length ?? 0,
    };
}
