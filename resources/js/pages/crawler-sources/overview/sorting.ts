import type { SortingState } from '@tanstack/react-table';

const crawlerSourceSortMap: Record<string, string> = {
    id: 'id',
    name: 'name',
    type: 'type',
    host: 'host',
    base_url: 'base_url',
    status: 'status',
    last_crawled_at: 'last_crawled_at',
    created_at: 'created_at',
};

export const defaultCrawlerSourceSorting: SortingState = [{ id: 'id', desc: true }];

export function toCrawlerSourceSortParam(sorting: SortingState) {
    const sort = sorting[0];
    if (!sort) return '';

    const field = crawlerSourceSortMap[sort.id];
    if (!field) return '';

    return sort.desc ? `-${field}` : field;
}
