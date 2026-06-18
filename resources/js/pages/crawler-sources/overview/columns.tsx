import { DataTableColumnHeader } from '@/components/custom/data-table-v1';
import { Badge } from '@/components/ui/badge';
import { formatDateTime } from '@/lib/date-format';
import type { ColumnDef } from '@tanstack/react-table';
import type { CrawlerSource } from '../shema';
import ActionsCellCrawlerSource from './ActionsCellCrawlerSource';

type CrawlerSourceColumnsOptions = {
    deletingId: number | null;
    onRequestDelete: (source: CrawlerSource) => void;
};

export function getCrawlerSourceColumns({ deletingId, onRequestDelete }: CrawlerSourceColumnsOptions): ColumnDef<CrawlerSource>[] {
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
            accessorKey: 'type',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Type" />,
            cell: ({ row }) => <Badge variant="secondary">{row.original.type ?? '-'}</Badge>,
        },
        {
            accessorKey: 'host',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Host" />,
            cell: ({ row }) => <span className="text-muted-foreground">{row.original.host ?? '-'}</span>,
        },
        {
            accessorKey: 'base_url',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Base URL" />,
            cell: ({ row }) => (
                <a href={row.original.base_url ?? '#'} target="_blank" rel="noreferrer" className="max-w-[360px] truncate text-blue-600 hover:underline">
                    {row.original.base_url ?? '-'}
                </a>
            ),
        },
        {
            id: 'profile_name',
            accessorFn: (row) => row.profile?.name ?? '',
            header: 'Profile',
            cell: ({ row }) => <span>{row.original.profile?.name ?? '-'}</span>,
            enableSorting: false,
        },
        {
            accessorKey: 'status',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
            cell: ({ row }) => <Badge variant={row.original.status === 'active' ? 'default' : 'outline'}>{row.original.status ?? '-'}</Badge>,
        },
        {
            accessorKey: 'last_crawled_at',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Last Crawled" />,
            cell: ({ row }) => <Badge variant="secondary">{formatDateTime(row.original.last_crawled_at)}</Badge>,
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
                <ActionsCellCrawlerSource
                    source={row.original}
                    deleting={deletingId === row.original.id}
                    onRequestDelete={onRequestDelete}
                />
            ),
            enableSorting: false,
            enableHiding: false,
        },
    ];
}
