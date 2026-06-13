import type { DataTableV1DateRangeFilter, DataTableV1FacetedFilter, DataTableV1Request, DataTableV1Response } from '@/components/custom/data-table-v1';
import type { Podcast } from '../shema';
import { toPodcastSortParam } from './sorting';

type PodcastIndexResponse = {
    data?: Podcast[];
    meta?: {
        total?: number;
    };
    total?: number;
};

export const podcastFacetedFilters: DataTableV1FacetedFilter[] = [
    {
        key: 'publisher_name',
        title: 'Publisher',
        columnKey: 'publisher_name',
        searchPlaceholder: 'Publisher',
    },
];

export const podcastDateRangeFilter: DataTableV1DateRangeFilter = {
    key: 'created_at',
    title: 'Created date',
};

export function buildPodcastIndexUrl(request: DataTableV1Request) {
    const params = new URLSearchParams({
        page: String(request.pageIndex + 1),
        per_page: String(request.pageSize),
    });

    const sort = toPodcastSortParam(request.sorting);

    if (sort) {
        params.set('sort', sort);
    }

    if (request.search.trim()) {
        params.set('filter[all]', request.search.trim());
    }

    const publishers = request.filters.facets.publisher_name ?? [];

    if (publishers.length) {
        params.set('filter[publisher_name]', publishers.join(','));
    }

    const createdAt = request.filters.dateRanges.created_at;

    if (createdAt?.from) {
        params.set('filter[created_from]', createdAt.from);
    }

    if (createdAt?.to) {
        params.set('filter[created_to]', createdAt.to);
    }

    return `/api/podcasts?${params.toString()}`;
}

export function normalizePodcastIndexResponse(json: PodcastIndexResponse): DataTableV1Response<Podcast> {
    return {
        data: json.data ?? [],
        total: json.meta?.total ?? json.total ?? json.data?.length ?? 0,
    };
}
