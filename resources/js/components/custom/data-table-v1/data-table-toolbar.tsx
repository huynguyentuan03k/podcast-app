import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Row, Table } from '@tanstack/react-table';
import { Download, Plus, Search, X } from 'lucide-react';
import { DataTableDateFilter } from './data-table-date-filter';
import { DataTableFacetedFilter } from './data-table-faceted-filter';
import { DataTableViewOptions } from './data-table-view-options';
import type { DataTableV1DateRangeFilter, DataTableV1FacetedFilter, DataTableV1FilterState } from './types';

type DataTableToolbarProps<TData> = {
    table: Table<TData>;
    search: string;
    onSearchChange: (value: string) => void;
    searchPlaceholder?: string;
    actions?: React.ReactNode | ((context: { table: Table<TData>; selectedRows: Row<TData>[] }) => React.ReactNode);
    facetedFilters?: DataTableV1FacetedFilter[];
    dateRangeFilter?: DataTableV1DateRangeFilter;
    filters: DataTableV1FilterState;
    onFacetChange: (key: string, value: string[]) => void;
    onDateRangeChange: (key: string, value: DataTableV1FilterState['dateRanges'][string]) => void;
};

export function DataTableToolbar<TData>({
    table,
    search,
    onSearchChange,
    searchPlaceholder = 'Search...',
    actions,
    facetedFilters,
    dateRangeFilter,
    filters,
    onFacetChange,
    onDateRangeChange,
}: DataTableToolbarProps<TData>) {
    const selectedRows = table.getFilteredSelectedRowModel().rows;
    const hasFilters =
        Boolean(search) ||
        Object.values(filters.facets).some((value) => value.length > 0) ||
        Object.values(filters.dateRanges).some((value) => value.from || value.to);

    return (
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-1 flex-wrap items-center gap-2">
                <div className="relative w-full md:max-w-sm">
                    <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input value={search} onChange={(event) => onSearchChange(event.target.value)} placeholder={searchPlaceholder} className="pl-9" />
                </div>
                {facetedFilters?.map((filter) => (
                    <DataTableFacetedFilter
                        key={filter.key}
                        title={filter.title}
                        options={filter.options}
                        value={filters.facets[filter.key] ?? []}
                        onChange={(value) => onFacetChange(filter.key, value)}
                    />
                ))}
                {dateRangeFilter ? (
                    <DataTableDateFilter
                        title={dateRangeFilter.title}
                        value={filters.dateRanges[dateRangeFilter.key] ?? {}}
                        onChange={(value) => onDateRangeChange(dateRangeFilter.key, value)}
                    />
                ) : null}
                {hasFilters ? (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1"
                        onClick={() => {
                            onSearchChange('');
                            facetedFilters?.forEach((filter) => onFacetChange(filter.key, []));
                            if (dateRangeFilter) {
                                onDateRangeChange(dateRangeFilter.key, {});
                            }
                        }}
                    >
                        <X className="size-4" />
                        Reset
                    </Button>
                ) : null}
            </div>
            <div className="flex flex-wrap items-center gap-2">
                {typeof actions === 'function' ? actions({ table, selectedRows }) : actions ?? (
                    <>
                        <Button variant="outline" size="sm" className="gap-2">
                            <Download className="size-4" />
                            Export
                        </Button>
                        <Button size="sm" className="gap-2">
                            <Plus className="size-4" />
                            Add
                        </Button>
                    </>
                )}
                <DataTableViewOptions table={table} />
            </div>
        </div>
    );
}
