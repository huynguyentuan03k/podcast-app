import { DataTableColumnHeader } from '@/components/custom/data-table-v1';
import { Badge } from '@/components/ui/badge';
import { formatDateTime } from '@/lib/date-format';
import type { ColumnDef } from '@tanstack/react-table';
import type { CrawlerItemAudio } from '../shema';

function statusVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
    if (['failed', 'invalid', 'missing'].includes(status)) return 'destructive';
    if (['active', 'imported'].includes(status)) return 'default';
    if (status === 'duplicate') return 'secondary';

    return 'outline';
}

export const crawlerItemAudioColumns: ColumnDef<CrawlerItemAudio>[] = [
    {
        accessorKey: 'position',
        header: ({ column }) => <DataTableColumnHeader column={column} title="#" />,
        cell: ({ row }) => row.original.position ?? '-',
        size: 80,
    },
    {
        accessorKey: 'title',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Title" />,
        cell: ({ row }) => <span className="font-medium">{row.original.title ?? '-'}</span>,
    },
    {
        accessorKey: 'audio_url',
        header: 'Audio URL',
        cell: ({ row }) => <span className="block max-w-[420px] truncate text-muted-foreground">{row.original.audio_url}</span>,
        enableSorting: false,
    },
    {
        accessorKey: 'status',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
        cell: ({ row }) => <Badge variant={statusVariant(row.original.status)}>{row.original.status}</Badge>,
    },
    {
        accessorKey: 'duration_seconds',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Duration" />,
        cell: ({ row }) => row.original.duration_seconds ? `${Math.round(row.original.duration_seconds / 60)} min` : '-',
    },
    {
        accessorKey: 'http_status',
        header: ({ column }) => <DataTableColumnHeader column={column} title="HTTP" />,
        cell: ({ row }) => row.original.http_status ?? '-',
    },
    {
        accessorKey: 'content_type',
        header: 'Content type',
        cell: ({ row }) => row.original.content_type ?? '-',
        enableSorting: false,
    },
    {
        accessorKey: 'last_crawled_at',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Last crawled" />,
        cell: ({ row }) => row.original.last_crawled_at ? <Badge variant="secondary">{formatDateTime(row.original.last_crawled_at)}</Badge> : '-',
    },
];
