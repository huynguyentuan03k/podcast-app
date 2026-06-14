import { DataTableColumnHeader } from '@/components/custom/data-table-v1';
import { Badge } from '@/components/ui/badge';
import { formatDateTime } from '@/lib/date-format';
import type { ColumnDef } from '@tanstack/react-table';
import { Pencil, Trash2 } from 'lucide-react';
import type { Tag } from '../shema';

type Options = {
    deletingId: number | null;
    onEdit: (tag: Tag) => void;
    onRequestDelete: (tag: Tag) => void;
};

export function getTagColumns({ deletingId, onEdit, onRequestDelete }: Options): ColumnDef<Tag>[] {
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
            accessorKey: 'slug',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Slug" />,
            cell: ({ row }) => <Badge variant="outline">{row.original.slug ?? '-'}</Badge>,
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
                <div className="flex items-center justify-end gap-1">
                    <button
                        type="button"
                        className="inline-flex size-9 items-center justify-center rounded-md text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                        onClick={() => onEdit(row.original)}
                    >
                        <Pencil className="size-4" />
                    </button>
                    <button
                        type="button"
                        className="inline-flex size-9 items-center justify-center rounded-md text-destructive hover:bg-red-50 hover:text-destructive"
                        disabled={deletingId === row.original.id}
                        onClick={() => onRequestDelete(row.original)}
                    >
                        <Trash2 className="size-4" />
                    </button>
                </div>
            ),
            enableSorting: false,
            enableHiding: false,
        },
    ];
}
