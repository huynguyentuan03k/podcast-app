import type { SortingState } from '@tanstack/react-table';

export const defaultUserSorting: SortingState = [{ id: 'created_at', desc: true }];

const sortMap: Record<string, string> = {
    id: 'id',
    name: 'name',
    email: 'email',
    created_at: 'created_at',
    updated_at: 'updated_at',
};

export function toUserSortParam(sorting: SortingState) {
    const first = sorting[0];

    if (!first) return '-created_at';

    const key = sortMap[first.id];

    if (!key) return '-created_at';

    return `${first.desc ? '-' : ''}${key}`;
}
