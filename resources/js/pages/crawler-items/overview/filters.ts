import type { DataTableV1DateRangeFilter, DataTableV1FacetedFilter, DataTableV1Request, DataTableV1Response } from '@/components/custom/data-table-v1';
import type { CrawlerItem, CrawlerItemAudio } from '../shema';
import { toCrawlerItemSortParam } from './sorting';

type IndexResponse<T> = {
    data?: T[];
    meta?: {
        total?: number;
    };
    total?: number;
};

export const crawlerItemFacetedFilters: DataTableV1FacetedFilter[] = [
    {
        key: 'status',
        title: 'Status',
        columnKey: 'status',
        options: [
            { label: 'Pending', value: 'pending' },
            { label: 'Processing', value: 'processing' },
            { label: 'Ready', value: 'ready' },
            { label: 'Imported', value: 'imported' },
            { label: 'Failed', value: 'failed' },
            { label: 'Duplicate', value: 'duplicate' },
        ],
    },
];

export const crawlerItemAudioFacetedFilters: DataTableV1FacetedFilter[] = [
    {
        key: 'status',
        title: 'Status',
        columnKey: 'status',
        options: [
            { label: 'Active', value: 'active' },
            { label: 'Imported', value: 'imported' },
            { label: 'Missing', value: 'missing' },
            { label: 'Invalid', value: 'invalid' },
            { label: 'Failed', value: 'failed' },
            { label: 'Duplicate', value: 'duplicate' },
        ],
    },
];

export const crawlerItemDateRangeFilter: DataTableV1DateRangeFilter = {
    key: 'created_at',
    title: 'Created date',
};

export function buildCrawlerItemIndexUrl(request: DataTableV1Request) {
    const params = new URLSearchParams({
        page: String(request.pageIndex + 1),
        per_page: String(request.pageSize),
    });

    const sort = toCrawlerItemSortParam(request.sorting);

    if (sort) {
        params.set('sort', sort);
    }

    if (request.search.trim()) {
        params.set('filter[all]', request.search.trim());
    }

    const statuses = request.filters.facets.status ?? [];

    if (statuses.length) {
        params.set('filter[status]', statuses.join(','));
    }

    const createdAt = request.filters.dateRanges.created_at;

    if (createdAt?.from) {
        params.set('filter[created_from]', createdAt.from);
    }

    if (createdAt?.to) {
        params.set('filter[created_to]', createdAt.to);
    }

    return `/frieren-crawler/admin/items?${params.toString()}`;
}

export function buildCrawlerItemAudiosUrl(itemId: number, request: DataTableV1Request) {
    const params = new URLSearchParams({
        page: String(request.pageIndex + 1),
        per_page: String(request.pageSize),
    });

    const sort = toCrawlerItemSortParam(request.sorting);

    if (sort) {
        params.set('sort', sort);
    }

    if (request.search.trim()) {
        params.set('filter[all]', request.search.trim());
    }

    const statuses = request.filters.facets.status ?? [];

    if (statuses.length) {
        params.set('filter[status]', statuses.join(','));
    }

    return `/frieren-crawler/admin/items/${itemId}/audios?${params.toString()}`;
}

export function normalizeCrawlerItemIndexResponse(json: IndexResponse<CrawlerItem>): DataTableV1Response<CrawlerItem> {
    return {
        data: json.data ?? [],
        total: json.meta?.total ?? json.total ?? json.data?.length ?? 0,
    };
}

export function normalizeCrawlerItemAudioIndexResponse(json: IndexResponse<CrawlerItemAudio>): DataTableV1Response<CrawlerItemAudio> {
    return {
        data: json.data ?? [],
        total: json.meta?.total ?? json.total ?? json.data?.length ?? 0,
    };
}
