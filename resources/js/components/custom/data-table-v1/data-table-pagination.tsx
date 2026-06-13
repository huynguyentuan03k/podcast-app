import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Table } from '@tanstack/react-table';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

type DataTablePaginationProps<TData> = {
    table: Table<TData>;
    total: number;
    pageSizeOptions?: number[];
};

export function DataTablePagination<TData>({ table, total, pageSizeOptions = [10, 20, 50, 100] }: DataTablePaginationProps<TData>) {
    const selectedRows = table.getFilteredSelectedRowModel().rows.length;
    const pageCount = Math.max(table.getPageCount(), 1);
    const pageIndex = table.getState().pagination.pageIndex;

    return (
        <div className="flex flex-col gap-3 px-1 py-2 md:flex-row md:items-center md:justify-between">
            <div className="text-sm text-muted-foreground">
                {selectedRows} of {total} row(s) selected.
            </div>
            <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Rows per page</span>
                    <Select value={`${table.getState().pagination.pageSize}`} onValueChange={(value) => table.setPageSize(Number(value))}>
                        <SelectTrigger className="h-9 w-20">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {pageSizeOptions.map((pageSize) => (
                                <SelectItem key={pageSize} value={`${pageSize}`}>
                                    {pageSize}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="text-sm font-medium">
                    Page {pageIndex + 1} of {pageCount}
                </div>
                <div className="flex items-center gap-1">
                    <Button variant="outline" size="icon" className="size-9" onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()}>
                        <ChevronsLeft className="size-4" />
                    </Button>
                    <Button variant="outline" size="icon" className="size-9" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
                        <ChevronLeft className="size-4" />
                    </Button>
                    <Button variant="outline" size="icon" className="size-9" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
                        <ChevronRight className="size-4" />
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        className="size-9"
                        onClick={() => table.setPageIndex(pageCount - 1)}
                        disabled={!table.getCanNextPage()}
                    >
                        <ChevronsRight className="size-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
