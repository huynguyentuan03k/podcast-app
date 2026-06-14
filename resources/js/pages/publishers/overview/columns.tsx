import { DataTableColumnHeader } from '@/components/custom/data-table-v1';
import { Badge } from '@/components/ui/badge';
import { formatDateTime } from '@/lib/date-format';
import type { ColumnDef } from '@tanstack/react-table';
import type { Publisher } from '../shema';
import ActionsCellPublisher from './ActionsCellPublisher';

type PublisherColumnsOptions = {
    deletingId: number | null;
    onDelete: (publisher: Publisher) => void;
    onRequestDelete: (publisher: Publisher) => void;
};

export function getPublisherColumns({ deletingId, onDelete, onRequestDelete }: PublisherColumnsOptions): ColumnDef<Publisher>[] {
    return [
        {
            accessorKey: 'id',
            header: ({ column }) => <DataTableColumnHeader column={column} title="ID" />,
            cell: ({ row }) => <span className="font-medium">{row.original.id}</span>,
            size: 80,
        },
        {
            accessorKey: 'name',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
            cell: ({ row }) => <span className="font-medium">{row.original.name ?? '-'}</span>,
        },
        {
            accessorKey: 'email',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Email" />,
            cell: ({ row }) => <span className="text-muted-foreground">{row.original.email ?? '-'}</span>,
        },
        {
            accessorKey: 'phone',
            header: 'Phone',
            cell: ({ row }) => <span>{row.original.phone ?? '-'}</span>,
            enableSorting: false,
        },
        {
            accessorKey: 'website',
            header: 'Website',
            cell: ({ row }) =>
                row.original.website ? (
                    <a href={row.original.website} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                        {row.original.website}
                    </a>
                ) : (
                    <span className="text-muted-foreground">-</span>
                ),
            enableSorting: false,
        },
        {
            accessorKey: 'established_year',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Year" />,
            cell: ({ row }) => <Badge variant="outline">{row.original.established_year ?? '-'}</Badge>,
        },
        {
            accessorKey: 'created_at',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Created" />,
            cell: ({ row }) => <Badge variant="secondary">{formatDateTime(row.original.created_at)}</Badge>,
        },
        {
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => (
                <ActionsCellPublisher
                    publisher={row.original}
                    deleting={deletingId === row.original.id}
                    onDelete={onDelete}
                    onRequestDelete={onRequestDelete}
                />
            ),
            enableSorting: false,
            enableHiding: false,
        },
    ];
}
