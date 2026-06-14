import { DataTableColumnHeader } from '@/components/custom/data-table-v1';
import { Badge } from '@/components/ui/badge';
import { formatDateTime } from '@/lib/date-format';
import type { ColumnDef } from '@tanstack/react-table';
import type { AdminRole } from '../shema';
import ActionsCellAdminRole from './ActionsCellAdminRole';

type AdminRoleColumnsOptions = {
    deletingId: number | null;
    onRequestDelete: (role: AdminRole) => void;
};

export function getAdminRoleColumns({ deletingId, onRequestDelete }: AdminRoleColumnsOptions): ColumnDef<AdminRole>[] {
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
            accessorKey: 'display_name',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Display Name" />,
            cell: ({ row }) => <span>{row.original.display_name ?? '-'}</span>,
        },
        {
            accessorKey: 'description',
            header: 'Description',
            cell: ({ row }) => <div className="line-clamp-2 max-w-96 text-muted-foreground">{row.original.description ?? '-'}</div>,
            enableSorting: false,
        },
        {
            id: 'permissions',
            header: 'Permissions',
            cell: ({ row }) => (
                <div className="flex max-w-96 flex-wrap gap-1">
                    {(row.original.permissions ?? []).length ? (
                        row.original.permissions?.slice(0, 3).map((permission) => (
                            <Badge key={permission} variant="outline">
                                {permission}
                            </Badge>
                        ))
                    ) : (
                        <span className="text-muted-foreground">-</span>
                    )}
                    {(row.original.permissions?.length ?? 0) > 3 ? <Badge variant="secondary">+{(row.original.permissions?.length ?? 0) - 3}</Badge> : null}
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
            cell: ({ row }) => <ActionsCellAdminRole role={row.original} deleting={deletingId === row.original.id} onRequestDelete={onRequestDelete} />,
            enableSorting: false,
            enableHiding: false,
        },
    ];
}
