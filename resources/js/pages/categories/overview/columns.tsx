import { DataTableColumnHeader } from '@/components/custom/data-table-v1';
import { Badge } from '@/components/ui/badge';
import type { ColumnDef } from '@tanstack/react-table';
import type { Category } from '../shema';
import ActionsCellCategory from './ActionsCellCategory';

type CategoryColumnsOptions = {
    deletingId: number | null;
    onDelete: (category: Category) => void;
    onRequestDelete: (category: Category) => void;
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

export function getCategoryColumns({ deletingId, onDelete, onRequestDelete }: CategoryColumnsOptions): ColumnDef<Category>[] {
    return [
        {
            accessorKey: 'id',
            header: ({ column }) => <DataTableColumnHeader column={column} title="ID" />,
            cell: ({ row }) => <span className="font-medium">{row.original.id}</span>,
            size: 80,
        },
        {
            id: 'name_en',
            accessorFn: (row) => row.name.en ?? '',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Name EN" />,
            cell: ({ row }) => <span className="font-medium">{row.original.name.en ?? '-'}</span>,
        },
        {
            id: 'name_vi',
            accessorFn: (row) => row.name.vi ?? '',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Name VI" />,
            cell: ({ row }) => <span className="font-medium">{row.original.name.vi ?? '-'}</span>,
        },
        {
            accessorKey: 'description',
            header: 'Description',
            cell: ({ row }) => <div className="line-clamp-3 max-w-96 text-muted-foreground">{row.original.description ?? '-'}</div>,
            enableSorting: false,
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
                <ActionsCellCategory
                    category={row.original}
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
