import type { SortingState } from '@tanstack/react-table';

const podcastSortMap: Record<string, string> = {
    id: 'id',
    title: 'title',
    slug: 'slug',
    episodes_count: 'episodes_count',
    created_at: 'created_at',
};

export const defaultPodcastSorting: SortingState = [{ id: 'id', desc: true }];

export function toPodcastSortParam(sorting: SortingState) {
    const sort = sorting[0];

    if (!sort) {
        return '';
    }

    const field = podcastSortMap[sort.id];

    if (!field) {
        return '';
    }

    return sort.desc ? `-${field}` : field;
}
