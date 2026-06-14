import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { formatDateTime } from '@/lib/date-format';
import { DataTableColumnHeader } from '@/components/custom/data-table-v1';
import type { ColumnDef } from '@tanstack/react-table';
import type { Author } from '../shema';
import ActionsCellAuthor from './ActionsCellAuthor';

type AuthorColumnsOptions = {
    deletingId: number | null;
    onDelete: (author: Author) => void;
    onRequestDelete: (author: Author) => void;
};

export function getAuthorColumns({ deletingId, onDelete, onRequestDelete }: AuthorColumnsOptions): ColumnDef<Author>[] {
    return [
        {
            id: 'avatar',
            header: 'Avatar',
            cell: ({ row }) =>
                <Avatar className="size-16">
                    <AvatarImage src={row.original.avatar_url ?? undefined} />
                    <AvatarFallback>{String(row.original.name ?? '?').slice(0, 1).toUpperCase()}</AvatarFallback>
                </Avatar>,
            enableSorting: false,
            size: 88,
        },
        {
            accessorKey: 'id',
            header: ({ column }) => <DataTableColumnHeader column={column} title="ID" />,
            cell: ({ row }) => <span className="font-medium">{row.original.id}</span>,
            size: 80,
        },
        {
            accessorKey: 'name',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
            cell: ({ row }) => <span className="font-medium">{String(row.original.name ?? '')}</span>,
        },
        {
            accessorKey: 'email',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Email" />,
            cell: ({ row }) => <span className="text-muted-foreground">{String(row.original.email ?? '')}</span>,
        },
        {
            accessorKey: 'website',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Website" />,
            cell: ({ row }) =>
                row.original.website ? (
                    <a href={String(row.original.website)} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                        {String(row.original.website)}
                    </a>
                ) : (
                    <span className="text-muted-foreground">-</span>
                ),
        },
        {
            accessorKey: 'bio',
            header: 'Bio',
            cell: ({ row }) => <div className="line-clamp-3 max-w-80 text-muted-foreground">{String(row.original.bio ?? '')}</div>,
            enableSorting: false,
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
                <ActionsCellAuthor
                    author={row.original}
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
