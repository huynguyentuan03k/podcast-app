import type { DataTableV1DateRangeFilter, DataTableV1FacetedFilter, DataTableV1Request, DataTableV1Response } from '@/components/custom/data-table-v1';
import type { Author } from '../shema';
import { toAuthorSortParam } from './sorting';

type AuthorIndexResponse = {
    data?: Author[];
    meta?: {
        total?: number;
    };
    total?: number;
};

export const authorFacetedFilters: DataTableV1FacetedFilter[] = [
    {
        key: 'status',
        title: 'Status',
        options: [
            { label: 'Active', value: 'active' },
            { label: 'Inactive', value: 'inactive' },
        ],
    },
];

export const authorDateRangeFilter: DataTableV1DateRangeFilter = {
    key: 'created_at',
    title: 'Created date',
};

export function buildAuthorIndexUrl(request: DataTableV1Request) {
    const params = new URLSearchParams({
        page: String(request.pageIndex + 1),
        per_page: String(request.pageSize),
    });

    const sort = toAuthorSortParam(request.sorting);

    if (sort) {
        params.set('sort', sort);
    }

    if (request.search.trim()) {
        params.set('filter[all]', request.search.trim());
    }

    const statuses = request.filters.facets.status ?? [];

    if (statuses.length === 1) {
        params.set('filter[status]', statuses[0]);
    }

    const createdAt = request.filters.dateRanges.created_at;

    if (createdAt?.from) {
        params.set('filter[created_from]', createdAt.from);
    }

    if (createdAt?.to) {
        params.set('filter[created_to]', createdAt.to);
    }

    return `/api/authors?${params.toString()}`;
}

export function normalizeAuthorIndexResponse(json: AuthorIndexResponse): DataTableV1Response<Author> {
    return {
        data: json.data ?? [],
        total: json.meta?.total ?? json.total ?? json.data?.length ?? 0,
    };
}
