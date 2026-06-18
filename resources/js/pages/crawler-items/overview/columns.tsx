import { DataTableColumnHeader } from '@/components/custom/data-table-v1';
import { Badge } from '@/components/ui/badge';
import { formatDateTime } from '@/lib/date-format';
import type { ColumnDef } from '@tanstack/react-table';
import type { CrawlerItem } from '../shema';
import ActionsCellCrawlerItem from './ActionsCellCrawlerItem';

type CrawlerItemColumnsOptions = {
    crawlingId: number | null;
    deletingId: number | null;
    onCrawl: (item: CrawlerItem) => void;
    onRequestDelete: (item: CrawlerItem) => void;
    hideSourceColumn?: boolean;
};

function statusVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
    if (status === 'failed') return 'destructive';
    if (['ready', 'imported'].includes(status)) return 'default';
    if (['pending', 'processing', 'discovered'].includes(status)) return 'secondary';

    return 'outline';
}

export function getCrawlerItemColumns({ crawlingId, deletingId, onCrawl, onRequestDelete, hideSourceColumn = false }: CrawlerItemColumnsOptions): ColumnDef<CrawlerItem>[] {
    const columns: ColumnDef<CrawlerItem>[] = [
        {
            id: 'thumbnail',
            header: 'Image',
            cell: ({ row }) =>
                row.original.thumbnail_url ? (
                    <img src={row.original.thumbnail_url} alt={row.original.title ?? 'Crawler item'} className="h-16 w-24 rounded-md object-cover" />
                ) : (
                    <div className="flex h-16 w-24 items-center justify-center rounded-md bg-muted text-xs text-muted-foreground">No image</div>
                ),
            enableSorting: false,
            size: 112,
        },
        {
            accessorKey: 'id',
            header: ({ column }) => <DataTableColumnHeader column={column} title="ID" />,
            cell: ({ row }) => <span className="font-medium">{row.original.id}</span>,
            size: 80,
        },
        {
            accessorKey: 'title',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Title" />,
            cell: ({ row }) => (
                <div className="max-w-[360px]">
                    <div className="truncate font-medium">{row.original.title ?? 'Untitled item'}</div>
                    <div className="truncate text-xs text-muted-foreground">{row.original.source_url}</div>
                </div>
            ),
        },
        {
            id: 'source',
            header: 'Source',
            cell: ({ row }) => <span>{row.original.source?.name ?? '-'}</span>,
            enableSorting: false,
        },
        {
            accessorKey: 'item_type',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Type" />,
            cell: ({ row }) => <Badge variant="secondary">{row.original.item_type ?? 'unknown'}</Badge>,
        },
        {
            accessorKey: 'status',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
            cell: ({ row }) => <Badge variant={statusVariant(row.original.status)}>{row.original.status}</Badge>,
        },
        {
            accessorKey: 'audio_count',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Audios" />,
            cell: ({ row }) => <Badge variant="outline">{row.original.audio_count || row.original.audios_count || 0}</Badge>,
        },
        {
            accessorKey: 'assets_count',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Assets" />,
            cell: ({ row }) => <Badge variant="outline">{row.original.assets_count ?? 0}</Badge>,
        },
        {
            accessorKey: 'last_crawled_at',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Last crawled" />,
            cell: ({ row }) => row.original.last_crawled_at ? <Badge variant="secondary">{formatDateTime(row.original.last_crawled_at)}</Badge> : '-',
        },
        {
            accessorKey: 'created_at',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Created" />,
            cell: ({ row }) => row.original.created_at ? <Badge variant="secondary">{formatDateTime(row.original.created_at)}</Badge> : '-',
        },
        {
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => (
                <ActionsCellCrawlerItem
                    item={row.original}
                    crawling={crawlingId === row.original.id}
                    deleting={deletingId === row.original.id}
                    onCrawl={onCrawl}
                    onRequestDelete={onRequestDelete}
                />
            ),
            enableSorting: false,
            enableHiding: false,
        },
    ];

    return hideSourceColumn ? columns.filter((column) => column.id !== 'source') : columns;
}
