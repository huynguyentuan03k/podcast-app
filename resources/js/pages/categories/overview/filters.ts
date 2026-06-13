import type { DataTableV1DateRangeFilter, DataTableV1FacetedFilter, DataTableV1Request, DataTableV1Response } from '@/components/custom/data-table-v1';
import type { Category } from '../shema';
import { toCategorySortParam } from './sorting';

type CategoryIndexResponse = {
    data?: Category[];
    meta?: {
        total?: number;
    };
    total?: number;
};

export const categoryFacetedFilters: DataTableV1FacetedFilter[] = [
    {
        key: 'name',
        title: 'Name',
        columnKey: 'name_en',
        searchPlaceholder: 'Name',
    },
];

export const categoryDateRangeFilter: DataTableV1DateRangeFilter = {
    key: 'created_at',
    title: 'Created date',
};

export function buildCategoryIndexUrl(request: DataTableV1Request) {
    const params = new URLSearchParams({
        page: String(request.pageIndex + 1),
        per_page: String(request.pageSize),
    });

    const sort = toCategorySortParam(request.sorting);

    if (sort) {
        params.set('sort', sort);
    }

    if (request.search.trim()) {
        params.set('filter[all]', request.search.trim());
    }

    const names = request.filters.facets.name ?? [];

    if (names.length) {
        params.set('filter[name]', names.join(','));
    }

    const createdAt = request.filters.dateRanges.created_at;

    if (createdAt?.from) {
        params.set('filter[created_from]', createdAt.from);
    }

    if (createdAt?.to) {
        params.set('filter[created_to]', createdAt.to);
    }

    return `/api/categories?${params.toString()}`;
}

export function normalizeCategoryIndexResponse(json: CategoryIndexResponse): DataTableV1Response<Category> {
    return {
        data: json.data ?? [],
        total: json.meta?.total ?? json.total ?? json.data?.length ?? 0,
    };
}
