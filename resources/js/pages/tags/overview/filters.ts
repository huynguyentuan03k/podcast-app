import type { DataTableV1DateRangeFilter, DataTableV1Request, DataTableV1Response } from '@/components/custom/data-table-v1';
import type { Tag } from '../shema';
import { toTagSortParam } from './sorting';

type TagIndexResponse = {
    data?: Tag[];
    meta?: {
        total?: number;
    };
    total?: number;
};

export const tagDateRangeFilter: DataTableV1DateRangeFilter = {
    key: 'created_at',
    title: 'Created date',
};

export function buildTagIndexUrl(request: DataTableV1Request) {
    const params = new URLSearchParams({
        page: String(request.pageIndex + 1),
        per_page: String(request.pageSize),
    });

    const sort = toTagSortParam(request.sorting);
    if (sort) params.set('sort', sort);

    if (request.search.trim()) {
        params.set('filter[name]', request.search.trim());
    }

    const createdAt = request.filters.dateRanges.created_at;
    if (createdAt?.from) params.set('filter[created_from]', createdAt.from);
    if (createdAt?.to) params.set('filter[created_to]', createdAt.to);

    return `/api/tags?${params.toString()}`;
}

export function normalizeTagIndexResponse(json: TagIndexResponse): DataTableV1Response<Tag> {
    return {
        data: json.data ?? [],
        total: json.meta?.total ?? json.total ?? json.data?.length ?? 0,
    };
}
