import type { DataTableV1DateRangeFilter, DataTableV1FacetedFilter, DataTableV1Request, DataTableV1Response } from '@/components/custom/data-table-v1';
import type { CrawlerSource } from '../shema';
import { toCrawlerSourceSortParam } from './sorting';

type CrawlerSourceIndexResponse = {
    data?: CrawlerSource[];
    meta?: {
        total?: number;
    };
    total?: number;
};

export const crawlerSourceFacetedFilters: DataTableV1FacetedFilter[] = [
    {
        key: 'status',
        title: 'Status',
        columnKey: 'status',
        options: [
            { label: 'Active', value: 'active' },
            { label: 'Paused', value: 'paused' },
        ],
    },
    {
        key: 'type',
        title: 'Type',
        columnKey: 'type',
    },
];

export const crawlerSourceDateRangeFilter: DataTableV1DateRangeFilter = {
    key: 'created_at',
    title: 'Created date',
};

export function buildCrawlerSourceIndexUrl(request: DataTableV1Request) {
    const params = new URLSearchParams({
        page: String(request.pageIndex + 1),
        per_page: String(request.pageSize),
    });

    const sort = toCrawlerSourceSortParam(request.sorting);

    if (sort) {
        params.set('sort', sort);
    }

    if (request.search.trim()) {
        params.set('search', request.search.trim());
    }

    const status = request.filters.facets.status ?? [];
    if (status.length) {
        params.set('status', status.join(','));
    }

    const type = request.filters.facets.type ?? [];
    if (type.length) {
        params.set('type', type.join(','));
    }

    const createdAt = request.filters.dateRanges.created_at;

    if (createdAt?.from) {
        params.set('filter[created_from]', createdAt.from);
    }

    if (createdAt?.to) {
        params.set('filter[created_to]', createdAt.to);
    }

    return `/api/frieren-crawler/admin/sources?${params.toString()}`;
}

export function normalizeCrawlerSourceIndexResponse(json: CrawlerSourceIndexResponse): DataTableV1Response<CrawlerSource> {
    return {
        data: json.data ?? [],
        total: json.meta?.total ?? json.total ?? json.data?.length ?? 0,
    };
}
