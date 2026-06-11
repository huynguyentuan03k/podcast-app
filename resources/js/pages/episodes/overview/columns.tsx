import { type ColumnDef } from '@tanstack/react-table';
import { type Episode } from '../shema';
import ActionsCellEpisode from './ActionsCellEpisode';

export const columns: ColumnDef<Episode>[] = [
    {
        accessorKey: 'id',
        header: 'ID',
    },
    {
        accessorKey: 'title',
        header: 'Title',
        cell: ({ row }) => <div className="font-medium">{row.original.title}</div>,
    },
    {
        accessorKey: 'slug',
        header: 'Slug',
    },
    {
        accessorKey: 'podcast_id',
        header: 'Podcast ID',
    },
    {
        accessorKey: 'audio_path',
        header: 'Audio',
        cell: ({ row }) => <div className="max-w-64 truncate text-muted-foreground">{row.original.audio_path}</div>,
    },
    {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => <ActionsCellEpisode episode={row.original} />,
    },
];
