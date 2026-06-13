import type { SortingState } from '@tanstack/react-table';

export const defaultAuthorSorting: SortingState = [{ id: 'id', desc: true }];

export const authorSortableColumns = ['id', 'name', 'email', 'website', 'created_at'] as const;

export function toAuthorSortParam(sorting: SortingState): string | null {
    const sort = sorting[0];

    if (!sort || !authorSortableColumns.includes(sort.id as (typeof authorSortableColumns)[number])) {
        return '-id';
    }

    return `${sort.desc ? '-' : ''}${sort.id}`;
}
