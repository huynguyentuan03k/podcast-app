import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Table } from '@tanstack/react-table';
import { SlidersHorizontal } from 'lucide-react';

type DataTableViewOptionsProps<TData> = {
    table: Table<TData>;
};

export function DataTableViewOptions<TData>({ table }: DataTableViewOptionsProps<TData>) {
    const columns = table
        .getAllColumns()
        .filter((column) => typeof column.accessorFn !== 'undefined' && column.getCanHide());

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                    <SlidersHorizontal className="size-4" />
                    View
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="grid gap-1 p-1">
                    {columns.map((column) => (
                        <label key={column.id} className="flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent">
                            <Checkbox checked={column.getIsVisible()} onCheckedChange={(value) => column.toggleVisibility(Boolean(value))} />
                            <span className="capitalize">{column.id.replaceAll('_', ' ')}</span>
                        </label>
                    ))}
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
