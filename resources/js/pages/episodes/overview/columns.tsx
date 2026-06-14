import { DataTableColumnHeader } from '@/components/custom/data-table-v1';
import { Badge } from '@/components/ui/badge';
import { formatDateTime } from '@/lib/date-format';
import type { ColumnDef } from '@tanstack/react-table';
import type { Episode } from '../shema';
import ActionsCellEpisode from './ActionsCellEpisode';

type EpisodeColumnsOptions = {
    deletingId: number | null;
    onDelete: (episode: Episode) => void;
    onRequestDelete: (episode: Episode) => void;
};

function formatDuration(value: Episode['duration']) {
    const seconds = Number(value ?? 0);

    if (!seconds) {
        return '-';
    }

    const minutes = Math.floor(seconds / 60);
    const rest = Math.floor(seconds % 60);

    return `${minutes}:${String(rest).padStart(2, '0')}`;
}

export function getEpisodeColumns({ deletingId, onDelete, onRequestDelete }: EpisodeColumnsOptions): ColumnDef<Episode>[] {
    return [
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
            id: 'podcast_title',
            accessorFn: (row) => row.podcast?.title ?? String(row.podcast_id),
            header: 'Podcast',
            cell: ({ row }) => <span>{row.original.podcast?.title ?? `#${row.original.podcast_id}`}</span>,
            enableSorting: false,
        },
        {
            accessorKey: 'audio_path',
            header: 'Audio URL',
            cell: ({ row }) =>
                row.original.audio_url || row.original.audio_path ? (
                    <a
                        href={row.original.audio_url ?? row.original.audio_path ?? '#'}
                        target="_blank"
                        rel="noreferrer"
                        className="line-clamp-1 max-w-80 text-blue-600 hover:underline"
                    >
                        {row.original.audio_path ?? row.original.audio_url}
                    </a>
                ) : (
                    <span className="text-muted-foreground">-</span>
                ),
            enableSorting: false,
        },
        {
            accessorKey: 'duration',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Duration" />,
            cell: ({ row }) => <Badge variant="outline">{formatDuration(row.original.duration)}</Badge>,
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
                <ActionsCellEpisode
                    episode={row.original}
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
