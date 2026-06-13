import type { SortingState } from '@tanstack/react-table';

const categorySortMap: Record<string, string> = {
    id: 'id',
    name_en: 'name',
    name_vi: 'name',
    created_at: 'created_at',
};

export const defaultCategorySorting: SortingState = [{ id: 'id', desc: true }];

export function toCategorySortParam(sorting: SortingState) {
    const sort = sorting[0];

    if (!sort) {
        return '';
    }

    const field = categorySortMap[sort.id];

    if (!field) {
        return '';
    }

    return sort.desc ? `-${field}` : field;
}
