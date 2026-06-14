import { DataTableColumnHeader } from '@/components/custom/data-table-v1';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { formatDateTime } from '@/lib/date-format';
import type { ColumnDef } from '@tanstack/react-table';
import type { User } from '../shema';
import ActionsCellUser from './ActionsCellUser';

type UserColumnsOptions = {
    deletingId: number | null;
    onRequestDelete: (user: User) => void;
};

export function getUserColumns({ deletingId, onRequestDelete }: UserColumnsOptions): ColumnDef<User>[] {
    return [
        {
            id: 'avatar',
            header: 'Avatar',
            cell: ({ row }) => (
                <Avatar className="size-12">
                    <AvatarImage src={row.original.profile?.avatar ?? undefined} />
                    <AvatarFallback>{row.original.name?.slice(0, 2).toUpperCase() ?? 'U'}</AvatarFallback>
                </Avatar>
            ),
            enableSorting: false,
            size: 72,
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
            cell: ({ row }) => <span className="font-medium">{row.original.name ?? '-'}</span>,
        },
        {
            accessorKey: 'email',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Email" />,
            cell: ({ row }) => <span>{row.original.email ?? '-'}</span>,
        },
        {
            id: 'email_verified_at',
            accessorFn: (row) => (row.email_verified_at ? 'verified' : 'unverified'),
            header: 'Email status',
            cell: ({ row }) => row.original.email_verified_at ? <Badge className="bg-emerald-600">Verified</Badge> : <Badge variant="secondary">Unverified</Badge>,
        },
        {
            id: 'devices_count',
            header: 'Devices',
            cell: ({ row }) => <Badge variant="outline">{row.original.devices_count ?? row.original.devices?.length ?? 0}</Badge>,
            enableSorting: false,
        },
        {
            id: 'social_accounts_count',
            header: 'Social',
            cell: ({ row }) => <Badge variant="outline">{row.original.social_accounts_count ?? row.original.social_accounts?.length ?? 0}</Badge>,
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
            cell: ({ row }) => <ActionsCellUser user={row.original} deleting={deletingId === row.original.id} onRequestDelete={onRequestDelete} />,
            enableSorting: false,
            enableHiding: false,
        },
    ];
}
