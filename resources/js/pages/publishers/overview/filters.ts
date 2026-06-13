import type { DataTableV1DateRangeFilter, DataTableV1FacetedFilter, DataTableV1Request, DataTableV1Response } from '@/components/custom/data-table-v1';
import type { Publisher } from '../shema';
import { toPublisherSortParam } from './sorting';

type PublisherIndexResponse = {
    data?: Publisher[];
    meta?: {
        total?: number;
    };
    total?: number;
};

export const publisherFacetedFilters: DataTableV1FacetedFilter[] = [
    {
        key: 'established_year',
        title: 'Year',
        columnKey: 'established_year',
        searchPlaceholder: 'Year',
    },
];

export const publisherDateRangeFilter: DataTableV1DateRangeFilter = {
    key: 'created_at',
    title: 'Created date',
};

export function buildPublisherIndexUrl(request: DataTableV1Request) {
    const params = new URLSearchParams({
        page: String(request.pageIndex + 1),
        per_page: String(request.pageSize),
    });

    const sort = toPublisherSortParam(request.sorting);

    if (sort) {
        params.set('sort', sort);
    }

    if (request.search.trim()) {
        params.set('filter[all]', request.search.trim());
    }

    const years = request.filters.facets.established_year ?? [];

    if (years.length) {
        params.set('filter[established_years]', years.join(','));
    }

    const createdAt = request.filters.dateRanges.created_at;

    if (createdAt?.from) {
        params.set('filter[created_from]', createdAt.from);
    }

    if (createdAt?.to) {
        params.set('filter[created_to]', createdAt.to);
    }

    return `/api/publishers?${params.toString()}`;
}

export function normalizePublisherIndexResponse(json: PublisherIndexResponse): DataTableV1Response<Publisher> {
    return {
        data: json.data ?? [],
        total: json.meta?.total ?? json.total ?? json.data?.length ?? 0,
    };
}
