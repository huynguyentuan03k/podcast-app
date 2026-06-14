import type { SortingState } from '@tanstack/react-table';

const adminSortMap: Record<string, string> = {
    id: 'id',
    username: 'username',
    email: 'email',
    status: 'status',
    created_at: 'created_at',
};

export const defaultAdminSorting: SortingState = [{ id: 'id', desc: true }];

export function toAdminSortParam(sorting: SortingState) {
    const sort = sorting[0];

    if (!sort) return '';

    const field = adminSortMap[sort.id];

    if (!field) return '';

    return sort.desc ? `-${field}` : field;
}
