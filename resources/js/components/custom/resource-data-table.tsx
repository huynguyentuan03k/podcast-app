import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@/lib/navigation';
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getSortedRowModel,
    useReactTable,
    type CellContext,
} from '@tanstack/react-table';
import { Plus, RefreshCw } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { ResourceActionCell } from './action-cell';
import { csrfToken, displayValue, getValue } from './helpers';
import { type ResourceConfig, type ResourceIndexResponse, type ResourceRecord } from './types';

export function ResourceDataTable({ config }: { config: ResourceConfig }) {
    const [data, setData] = useState<ResourceRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [globalFilter, setGlobalFilter] = useState('');
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const load = async () => {
        setLoading(true);
        const response = await fetch(`${config.endpoint}?per_page=50`, {
            credentials: 'same-origin',
            headers: { Accept: 'application/json' },
        });
        const json = (await response.json()) as ResourceIndexResponse;
        setData(json.data ?? []);
        setLoading(false);
    };

    useEffect(() => {
        void load();
    }, [config.endpoint]);

    const remove = async (record: ResourceRecord) => {
        if (!confirm(`Delete ${config.singular} #${record.id}?`)) return;
        setDeletingId(record.id);
        await fetch(`${config.endpoint}/${record.id}`, {
            method: 'DELETE',
            credentials: 'same-origin',
            headers: {
                Accept: 'application/json',
                'X-CSRF-TOKEN': csrfToken(),
            },
        });
        setDeletingId(null);
        await load();
    };

    const columns = useMemo<ColumnDef<ResourceRecord>[]>(
        () => [
            ...config.columns.map((column) => ({
                id: column.key,
                header: column.label,
                accessorFn: (row: ResourceRecord) => displayValue(getValue(row, column.key)),
                cell: ({ row }: CellContext<ResourceRecord, unknown>) => <span>{displayValue(getValue(row.original, column.key))}</span>,
            })),
            {
                id: 'actions',
                header: 'Actions',
                cell: ({ row }) => (
                    <ResourceActionCell config={config} record={row.original} deleting={deletingId === row.original.id} onDelete={remove} />
                ),
            },
        ],
        [config, deletingId],
    );

    const table = useReactTable({
        data,
        columns,
        state: { globalFilter },
        onGlobalFilterChange: setGlobalFilter,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
    });

    return (
        <AppLayout breadcrumbs={config.breadcrumbs}>
            <Head title={config.title} />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold">{config.title}</h1>
                        <p className="text-sm text-muted-foreground">{config.endpoint}</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="icon" onClick={() => void load()}>
                            <RefreshCw className="size-4" />
                        </Button>
                        <Button asChild>
                            <Link href={`${config.basePath}/create`}>
                                <Plus className="mr-2 size-4" />
                                New
                            </Link>
                        </Button>
                    </div>
                </div>

                <Input
                    placeholder={`Search ${config.title.toLowerCase()}...`}
                    value={globalFilter}
                    onChange={(event) => setGlobalFilter(event.target.value)}
                    className="max-w-sm"
                />

                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={columns.length}>Loading...</TableCell>
                                </TableRow>
                            ) : table.getRowModel().rows.length ? (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow key={row.id}>
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={columns.length}>No records.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </AppLayout>
    );
}
