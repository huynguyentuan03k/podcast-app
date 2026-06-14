import type { SortingState } from '@tanstack/react-table';

const episodeSortMap: Record<string, string> = {
    id: 'id',
    title: 'title',
    slug: 'slug',
    duration: 'duration',
    created_at: 'created_at',
};

export const defaultEpisodeSorting: SortingState = [{ id: 'id', desc: true }];

export function toEpisodeSortParam(sorting: SortingState) {
    const sort = sorting[0];

    if (!sort) {
        return '';
    }

    const field = episodeSortMap[sort.id];

    if (!field) {
        return '';
    }

    return sort.desc ? `-${field}` : field;
}
