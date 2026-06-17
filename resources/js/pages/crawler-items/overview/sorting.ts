import type { SortingState } from '@tanstack/react-table';

export const defaultCrawlerItemSorting: SortingState = [
    {
        id: 'created_at',
        desc: true,
    },
];

export const defaultCrawlerItemAudioSorting: SortingState = [
    {
        id: 'position',
        desc: false,
    },
];

export function toCrawlerItemSortParam(sorting: SortingState) {
    const first = sorting[0];

    if (!first) return null;

    return `${first.desc ? '-' : ''}${first.id}`;
}
