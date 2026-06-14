import type { SortingState } from '@tanstack/react-table';

const adminRoleSortMap: Record<string, string> = {
    id: 'id',
    name: 'name',
    display_name: 'display_name',
    created_at: 'created_at',
};

export const defaultAdminRoleSorting: SortingState = [{ id: 'id', desc: true }];

export function toAdminRoleSortParam(sorting: SortingState) {
    const sort = sorting[0];

    if (!sort) return '';

    const field = adminRoleSortMap[sort.id];

    if (!field) return '';

    return sort.desc ? `-${field}` : field;
}
