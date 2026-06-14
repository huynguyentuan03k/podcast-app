import type { DataTableV1DateRangeFilter, DataTableV1FacetedFilter, DataTableV1Request, DataTableV1Response } from '@/components/custom/data-table-v1';
import type { Episode } from '../shema';
import { toEpisodeSortParam } from './sorting';

type EpisodeIndexResponse = {
    data?: Episode[];
    meta?: {
        total?: number;
    };
    total?: number;
};

export const episodeFacetedFilters: DataTableV1FacetedFilter[] = [
    {
        key: 'podcast_title',
        title: 'Podcast',
        columnKey: 'podcast_title',
        searchPlaceholder: 'Podcast',
    },
];

export const episodeDateRangeFilter: DataTableV1DateRangeFilter = {
    key: 'created_at',
    title: 'Created date',
};

export function buildEpisodeIndexUrl(request: DataTableV1Request) {
    const params = new URLSearchParams({
        page: String(request.pageIndex + 1),
        per_page: String(request.pageSize),
    });

    const sort = toEpisodeSortParam(request.sorting);

    if (sort) {
        params.set('sort', sort);
    }

    if (request.search.trim()) {
        params.set('filter[all]', request.search.trim());
    }

    const podcasts = request.filters.facets.podcast_title ?? [];

    if (podcasts.length) {
        params.set('filter[podcast_title]', podcasts.join(','));
    }

    const createdAt = request.filters.dateRanges.created_at;

    if (createdAt?.from) {
        params.set('filter[created_from]', createdAt.from);
    }

    if (createdAt?.to) {
        params.set('filter[created_to]', createdAt.to);
    }

    return `/api/episodes?${params.toString()}`;
}

export function normalizeEpisodeIndexResponse(json: EpisodeIndexResponse): DataTableV1Response<Episode> {
    return {
        data: json.data ?? [],
        total: json.meta?.total ?? json.total ?? json.data?.length ?? 0,
    };
}
