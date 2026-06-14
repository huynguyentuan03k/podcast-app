import type { DataTableV1DateRangeFilter, DataTableV1FacetedFilter, DataTableV1Request, DataTableV1Response } from '@/components/custom/data-table-v1';
import type { User } from '../shema';
import { toUserSortParam } from './sorting';

type UserIndexResponse = {
    data?: User[];
    meta?: {
        total?: number;
    };
    total?: number;
};

export const userFacetedFilters: DataTableV1FacetedFilter[] = [
    {
        key: 'email_verified_at',
        title: 'Email status',
        columnKey: 'email_verified_at',
        options: [
            { label: 'Verified', value: 'verified' },
            { label: 'Unverified', value: 'unverified' },
        ],
    },
];

export const userDateRangeFilter: DataTableV1DateRangeFilter = {
    key: 'created_at',
    title: 'Created date',
};

export function buildUserIndexUrl(request: DataTableV1Request) {
    const params = new URLSearchParams({
        page: String(request.pageIndex + 1),
        per_page: String(request.pageSize),
    });

    const sort = toUserSortParam(request.sorting);

    if (sort) {
        params.set('sort', sort);
    }

    if (request.search.trim()) {
        params.set('filter[all]', request.search.trim());
    }

    const createdAt = request.filters.dateRanges.created_at;
    const emailStatuses = request.filters.facets.email_verified_at ?? [];

    if (emailStatuses.length) {
        params.set('filter[email_status]', emailStatuses.join(','));
    }

    if (createdAt?.from) {
        params.set('filter[created_from]', createdAt.from);
    }

    if (createdAt?.to) {
        params.set('filter[created_to]', createdAt.to);
    }

    return `/api/users?${params.toString()}`;
}

export function normalizeUserIndexResponse(json: UserIndexResponse): DataTableV1Response<User> {
    return {
        data: json.data ?? [],
        total: json.meta?.total ?? json.total ?? json.data?.length ?? 0,
    };
}
