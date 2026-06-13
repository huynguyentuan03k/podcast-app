import { DataTableColumnHeader } from '@/components/custom/data-table-v1';
import { Badge } from '@/components/ui/badge';
import type { ColumnDef } from '@tanstack/react-table';
import type { Podcast } from '../shema';
import ActionsCellPodcast from './ActionsCellPodcast';

type PodcastColumnsOptions = {
    deletingId: number | null;
    onDelete: (podcast: Podcast) => void;
    onRequestDelete: (podcast: Podcast) => void;
};

function formatDate(value: unknown) {
    if (!value) {
        return '';
    }

    return new Intl.DateTimeFormat('en', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
    }).format(new Date(String(value)));
}

export function getPodcastColumns({ deletingId, onDelete, onRequestDelete }: PodcastColumnsOptions): ColumnDef<Podcast>[] {
    return [
        {
            id: 'cover',
            header: 'Cover',
            cell: ({ row }) =>
                row.original.cover_url ? (
                    <img src={row.original.cover_url} alt={row.original.title ?? 'Podcast cover'} className="h-16 w-24 rounded-md object-cover" />
                ) : (
                    <div className="flex h-16 w-24 items-center justify-center rounded-md bg-muted text-xs text-muted-foreground">No cover</div>
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
            cell: ({ row }) => <span className="font-medium">{row.original.title ?? '-'}</span>,
        },
        {
            accessorKey: 'slug',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Slug" />,
            cell: ({ row }) => <span className="text-muted-foreground">{row.original.slug ?? '-'}</span>,
        },
        {
            id: 'publisher_name',
            accessorFn: (row) => row.publisher?.name ?? '',
            header: 'Publisher',
            cell: ({ row }) => <span>{row.original.publisher?.name ?? '-'}</span>,
            enableSorting: false,
        },
        {
            accessorKey: 'episodes_count',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Episodes" />,
            cell: ({ row }) => <Badge variant="outline">{row.original.episodes_count ?? 0}</Badge>,
        },
        {
            accessorKey: 'created_at',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Created" />,
            cell: ({ row }) => <Badge variant="secondary">{formatDate(row.original.created_at)}</Badge>,
        },
        {
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => (
                <ActionsCellPodcast
                    podcast={row.original}
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
