import type { ColumnDef, PaginationState, Row, SortingState, Table, VisibilityState } from '@tanstack/react-table';

export type DataTableV1Request = {
    pageIndex: number;
    pageSize: number;
    search: string;
    sorting: SortingState;
    filters: DataTableV1FilterState;
};

export type DataTableV1Response<TData> = {
    data: TData[];
    total: number;
};

export type DataTableV1Fetch<TData> = (request: DataTableV1Request) => Promise<DataTableV1Response<TData>>;

export type DataTableV1Props<TData, TValue> = {
    title?: string;
    columns: ColumnDef<TData, TValue>[];
    queryKey: readonly unknown[];
    queryFn: DataTableV1Fetch<TData>;
    searchPlaceholder?: string;
    initialPageSize?: number;
    pageSizeOptions?: number[];
    actions?: React.ReactNode | ((context: { table: Table<TData>; selectedRows: Row<TData>[] }) => React.ReactNode);
    onRowClick?: (row: TData) => void;
    initialSorting?: SortingState;
    initialColumnVisibility?: VisibilityState;
    facetedFilters?: DataTableV1FacetedFilter[];
    dateRangeFilter?: DataTableV1DateRangeFilter;
};

export type DataTableV1State = {
    search: string;
    sorting: SortingState;
    pagination: PaginationState;
    columnVisibility: VisibilityState;
};

export type DataTableV1FacetedFilterOption = {
    label: string;
    value: string;
    count?: number;
};

export type DataTableV1FacetedFilter = {
    key: string;
    title: string;
    options: DataTableV1FacetedFilterOption[];
};

export type DataTableV1DateRange = {
    from?: string;
    to?: string;
};

export type DataTableV1DateRangeFilter = {
    key: string;
    title: string;
};

export type DataTableV1FilterState = {
    facets: Record<string, string[]>;
    dateRanges: Record<string, DataTableV1DateRange>;
};
