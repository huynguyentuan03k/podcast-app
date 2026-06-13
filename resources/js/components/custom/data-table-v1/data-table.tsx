import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import {
    flexRender,
    getCoreRowModel,
    useReactTable,
    type ColumnDef,
    type PaginationState,
    type RowSelectionState,
    type SortingState,
    type VisibilityState,
} from '@tanstack/react-table';
import { useMemo, useState } from 'react';
import { DataTableColumnHeader } from './data-table-column-header';
import { DataTablePagination } from './data-table-pagination';
import { DataTableSkeleton } from './data-table-skeleton';
import { DataTableToolbar } from './data-table-toolbar';
import type { DataTableV1DateRange, DataTableV1FilterState, DataTableV1Props } from './types';

function selectionColumn<TData>(): ColumnDef<TData> {
    return {
        id: 'select',
        header: ({ table }) => (
            <Checkbox
                checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(Boolean(value))}
                aria-label="Select all"
            />
        ),
        cell: ({ row }) => (
            <Checkbox checked={row.getIsSelected()} onCheckedChange={(value) => row.toggleSelected(Boolean(value))} aria-label="Select row" />
        ),
        enableSorting: false,
        enableHiding: false,
        size: 40,
    };
}

export function DataTableV1<TData, TValue>({
    title,
    columns,
    queryKey,
    queryFn,
    searchPlaceholder,
    initialPageSize = 10,
    pageSizeOptions,
    actions,
    onRowClick,
    initialSorting = [],
    initialColumnVisibility = {},
    facetedFilters,
    dateRangeFilter,
}: DataTableV1Props<TData, TValue>) {
    const [search, setSearch] = useState('');
    const [sorting, setSorting] = useState<SortingState>(initialSorting);
    const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: initialPageSize });
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(initialColumnVisibility);
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
    const [filters, setFilters] = useState<DataTableV1FilterState>({ facets: {}, dateRanges: {} });

    const tableColumns = useMemo<ColumnDef<TData, unknown>[]>(() => [selectionColumn<TData>(), ...(columns as ColumnDef<TData, unknown>[])], [columns]);

    const query = useQuery({
        queryKey: [...queryKey, { filters, pagination, search, sorting }],
        queryFn: () => queryFn({ pageIndex: pagination.pageIndex, pageSize: pagination.pageSize, search, sorting, filters }),
        placeholderData: keepPreviousData,
    });

    const rows = query.data?.data ?? [];
    const total = query.data?.total ?? 0;
    const pageCount = Math.max(Math.ceil(total / pagination.pageSize), 1);

    const table = useReactTable({
        data: rows,
        columns: tableColumns,
        pageCount,
        state: { sorting, pagination, columnVisibility, rowSelection },
        manualPagination: true,
        manualSorting: true,
        enableRowSelection: true,
        onSortingChange: setSorting,
        onPaginationChange: setPagination,
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        getCoreRowModel: getCoreRowModel(),
    });

    const updateSearch = (value: string) => {
        setSearch(value);
        setPagination((current) => ({ ...current, pageIndex: 0 }));
        setRowSelection({});
    };

    const updateFacet = (key: string, value: string[]) => {
        setFilters((current) => ({
            ...current,
            facets: {
                ...current.facets,
                [key]: value,
            },
        }));
        setPagination((current) => ({ ...current, pageIndex: 0 }));
        setRowSelection({});
    };

    const updateDateRange = (key: string, value: DataTableV1DateRange) => {
        setFilters((current) => ({
            ...current,
            dateRanges: {
                ...current.dateRanges,
                [key]: value,
            },
        }));
        setPagination((current) => ({ ...current, pageIndex: 0 }));
        setRowSelection({});
    };

    return (
        <div className="flex w-full flex-col gap-4">
            {title ? <h2 className="text-xl font-semibold">{title}</h2> : null}
            <DataTableToolbar
                table={table}
                search={search}
                onSearchChange={updateSearch}
                searchPlaceholder={searchPlaceholder}
                actions={actions}
                facetedFilters={facetedFilters}
                dateRangeFilter={dateRangeFilter}
                filters={filters}
                onFacetChange={updateFacet}
                onDateRangeChange={updateDateRange}
            />
            {query.isPending ? (
                <DataTableSkeleton columns={tableColumns.length} rows={pagination.pageSize} />
            ) : (
                <div className="overflow-hidden rounded-md border">
                    <Table>
                        <TableHeader>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => (
                                        <TableHead key={header.id} style={{ width: header.getSize() }}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(header.column.columnDef.header, {
                                                      ...header.getContext(),
                                                      DataTableColumnHeader,
                                                  })}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {table.getRowModel().rows.length ? (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow
                                        key={row.id}
                                        data-state={row.getIsSelected() && 'selected'}
                                        className={cn(onRowClick && 'cursor-pointer')}
                                        onClick={() => onRowClick?.(row.original)}
                                    >
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell
                                                key={cell.id}
                                                onClick={(event) => {
                                                    if (cell.column.id === 'select' || cell.column.id === 'actions') {
                                                        event.stopPropagation();
                                                    }
                                                }}
                                            >
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={tableColumns.length} className="h-24 text-center text-muted-foreground">
                                        No results.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            )}
            <DataTablePagination table={table} total={total} pageSizeOptions={pageSizeOptions} />
            {query.isFetching && !query.isPending ? <p className="text-sm text-muted-foreground">Updating table...</p> : null}
        </div>
    );
}
