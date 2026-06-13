import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Column } from '@tanstack/react-table';
import { ArrowDown, ArrowUp, ChevronsUpDown, EyeOff } from 'lucide-react';

type DataTableColumnHeaderProps<TData, TValue> = React.HTMLAttributes<HTMLDivElement> & {
    column: Column<TData, TValue>;
    title: string;
};

export function DataTableColumnHeader<TData, TValue>({ column, title, className }: DataTableColumnHeaderProps<TData, TValue>) {
    if (!column.getCanSort()) {
        return <div className={cn(className)}>{title}</div>;
    }

    const sorted = column.getIsSorted();

    return (
        <div className={cn('flex items-center gap-2', className)}>
            <Button
                variant="ghost"
                size="sm"
                className="-ml-3 h-8 gap-1 px-2 text-sm font-medium"
                onClick={() => column.toggleSorting(sorted === 'asc')}
            >
                <span>{title}</span>
                {sorted === 'desc' ? (
                    <ArrowDown className="size-4" />
                ) : sorted === 'asc' ? (
                    <ArrowUp className="size-4" />
                ) : (
                    <ChevronsUpDown className="size-4 opacity-60" />
                )}
            </Button>
            {column.getCanHide() ? (
                <Button variant="ghost" size="icon" className="size-7 opacity-50 hover:opacity-100" onClick={() => column.toggleVisibility(false)}>
                    <EyeOff className="size-3.5" />
                    <span className="sr-only">Hide column</span>
                </Button>
            ) : null}
        </div>
    );
}
