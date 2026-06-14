import { DataTableColumnHeader } from '@/components/custom/data-table-v1';
import { Badge } from '@/components/ui/badge';
import { formatDateTime } from '@/lib/date-format';
import type { ColumnDef } from '@tanstack/react-table';
import type { Admin } from '../shema';
import ActionsCellAdmin from './ActionsCellAdmin';

type AdminColumnsOptions = {
    deletingId: number | null;
    onRequestDelete: (admin: Admin) => void;
};

export function getAdminColumns({ deletingId, onRequestDelete }: AdminColumnsOptions): ColumnDef<Admin>[] {
    return [
        {
            accessorKey: 'id',
            header: ({ column }) => <DataTableColumnHeader column={column} title="ID" />,
            cell: ({ row }) => <span className="font-medium">{row.original.id}</span>,
            size: 80,
        },
        {
            accessorKey: 'username',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Username" />,
            cell: ({ row }) => <span className="font-medium">{row.original.username ?? '-'}</span>,
        },
        {
            accessorKey: 'email',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Email" />,
            cell: ({ row }) => <span className="text-muted-foreground">{row.original.email ?? '-'}</span>,
        },
        {
            accessorKey: 'status',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
            cell: ({ row }) => (
                <Badge variant={row.original.status === 'active' ? 'default' : 'secondary'} className={row.original.status === 'active' ? 'bg-green-600 text-white hover:bg-green-600' : ''}>
                    {row.original.status ?? '-'}
                </Badge>
            ),
        },
        {
            id: 'roles',
            header: 'Roles',
            cell: ({ row }) => (
                <div className="flex max-w-80 flex-wrap gap-1">
                    {(row.original.roles ?? []).length ? (
                        row.original.roles?.slice(0, 3).map((role) => (
                            <Badge key={role} variant="outline">
                                {role}
                            </Badge>
                        ))
                    ) : (
                        <span className="text-muted-foreground">-</span>
                    )}
                    {(row.original.roles?.length ?? 0) > 3 ? <Badge variant="secondary">+{(row.original.roles?.length ?? 0) - 3}</Badge> : null}
                </div>
            ),
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
            cell: ({ row }) => <ActionsCellAdmin admin={row.original} deleting={deletingId === row.original.id} onRequestDelete={onRequestDelete} />,
            enableSorting: false,
            enableHiding: false,
        },
    ];
}
