import type { SortingState } from '@tanstack/react-table';

const publisherSortMap: Record<string, string> = {
    id: 'id',
    name: 'name',
    email: 'email',
    established_year: 'established_year',
    created_at: 'created_at',
};

export const defaultPublisherSorting: SortingState = [{ id: 'id', desc: true }];

export function toPublisherSortParam(sorting: SortingState) {
    const sort = sorting[0];

    if (!sort) {
        return '';
    }

    const field = publisherSortMap[sort.id];

    if (!field) {
        return '';
    }

    return sort.desc ? `-${field}` : field;
}
