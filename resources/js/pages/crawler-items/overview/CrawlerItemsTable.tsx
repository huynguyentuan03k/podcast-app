import { DataTableV1 } from '@/components/custom/data-table-v1';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/hooks/use-toast';
import http from '@/http/client';
import { Link } from '@/lib/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Bot, Play, Plus, Trash2 } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { crawlerItemConfig, type CrawlerItem } from '../shema';
import { getCrawlerItemColumns } from './columns';
import { buildCrawlerItemIndexUrl, crawlerItemDateRangeFilter, crawlerItemFacetedFilters, normalizeCrawlerItemIndexResponse } from './filters';
import { defaultCrawlerItemSorting } from './sorting';

type CrawlerItemsTableProps = {
    title?: string;
    sourceId?: number;
    createHref?: string;
};

export default function CrawlerItemsTable({ title = crawlerItemConfig.title, sourceId, createHref }: CrawlerItemsTableProps) {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const [crawlingId, setCrawlingId] = useState<number | null>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [crawlTarget, setCrawlTarget] = useState<CrawlerItem | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<CrawlerItem | null>(null);
    const [bulkCrawling, setBulkCrawling] = useState(false);
    const [bulkDeleting, setBulkDeleting] = useState(false);
    const [bulkTarget, setBulkTarget] = useState<{ items: CrawlerItem[]; resetSelection: () => void } | null>(null);
    const [bulkDeleteTarget, setBulkDeleteTarget] = useState<{ items: CrawlerItem[]; resetSelection: () => void } | null>(null);

    const invalidateItems = useCallback(async () => {
        await Promise.all([
            queryClient.invalidateQueries({ queryKey: ['crawler-items'] }),
            queryClient.invalidateQueries({ queryKey: ['crawler-sources'] }),
        ]);
    }, [queryClient]);

    const crawlItem = useCallback(async (item: CrawlerItem) => {
        setCrawlingId(item.id);

        try {
            await http.post(`/frieren-crawler/admin/items/${item.id}/crawl`);
            toast({ title: 'crawl item dispatched successfully', description: 'Crawler service is processing this item.' });
            await invalidateItems();
        } catch {
            toast({ title: 'crawl item failed', description: 'Please check crawler service URL and endpoint.', variant: 'destructive' });
        } finally {
            setCrawlingId(null);
            setCrawlTarget(null);
        }
    }, [invalidateItems, toast]);

    const crawlSelectedItems = useCallback(async (items: CrawlerItem[], resetSelection: () => void) => {
        if (!items.length) return;

        setBulkCrawling(true);
        const results = await Promise.allSettled(items.map((item) => http.post(`/frieren-crawler/admin/items/${item.id}/crawl`)));
        const failed = results.filter((result) => result.status === 'rejected').length;
        const dispatched = items.length - failed;

        if (dispatched > 0) {
            toast({ title: 'crawl items dispatched successfully', description: `${dispatched} item(s) were sent to crawler service.` });
        }

        if (failed > 0) {
            toast({ title: 'crawl items failed', description: `${failed} item(s) could not be dispatched.`, variant: 'destructive' });
        }

        resetSelection();
        await invalidateItems();
        setBulkCrawling(false);
        setBulkTarget(null);
    }, [invalidateItems, toast]);

    const deleteItem = useCallback(async (item: CrawlerItem) => {
        setDeletingId(item.id);

        try {
            await http.delete(`/frieren-crawler/admin/items/${item.id}`);
            toast({ title: 'delete crawler item successfully', description: 'crawler item has been deleted.' });
            await invalidateItems();
        } catch {
            toast({ title: 'delete crawler item failed', description: 'Something went wrong', variant: 'destructive' });
        } finally {
            setDeletingId(null);
            setDeleteTarget(null);
        }
    }, [invalidateItems, toast]);

    const deleteSelectedItems = useCallback(async (items: CrawlerItem[], resetSelection: () => void) => {
        if (!items.length) return;

        setBulkDeleting(true);
        const results = await Promise.allSettled(items.map((item) => http.delete(`/frieren-crawler/admin/items/${item.id}`)));
        const failed = results.filter((result) => result.status === 'rejected').length;
        const deleted = items.length - failed;

        if (deleted > 0) {
            toast({ title: 'delete crawler items successfully', description: `${deleted} crawler item(s) have been deleted.` });
        }

        if (failed > 0) {
            toast({ title: 'delete crawler items failed', description: `${failed} crawler item(s) could not be deleted.`, variant: 'destructive' });
        }

        resetSelection();
        await invalidateItems();
        setBulkDeleting(false);
        setBulkDeleteTarget(null);
    }, [invalidateItems, toast]);

    const columns = useMemo(
        () => getCrawlerItemColumns({ crawlingId, deletingId, onCrawl: setCrawlTarget, onRequestDelete: setDeleteTarget, hideSourceColumn: Boolean(sourceId) }),
        [crawlingId, deletingId, sourceId],
    );

    return (
        <>
            <DataTableV1
                title={title}
                columns={columns}
                queryKey={['crawler-items', 'table', sourceId ?? 'all']}
                searchPlaceholder="Search crawler items"
                initialSorting={defaultCrawlerItemSorting}
                facetedFilters={crawlerItemFacetedFilters}
                dateRangeFilter={crawlerItemDateRangeFilter}
                actions={({ selectedRows, table }) => {
                    const selectedItems = selectedRows.map((row) => row.original);

                    return selectedItems.length > 0 ? (
                        <>
                            <Button
                                variant="destructive"
                                size="sm"
                                className="gap-2"
                                disabled={bulkDeleting}
                                onClick={() => setBulkDeleteTarget({ items: selectedItems, resetSelection: () => table.resetRowSelection() })}
                            >
                                <Trash2 className="size-4" />
                                Delete selected ({selectedItems.length})
                            </Button>
                            <Button
                                size="sm"
                                className="gap-2 bg-blue-600 text-white hover:bg-blue-700"
                                disabled={bulkCrawling}
                                onClick={() => setBulkTarget({ items: selectedItems, resetSelection: () => table.resetRowSelection() })}
                            >
                                <Bot className="size-4" />
                                Crawl selected ({selectedItems.length})
                            </Button>
                        </>
                    ) : (
                        <Button asChild size="sm" className="gap-2 bg-blue-600 text-white hover:bg-blue-700">
                            <Link href={createHref ?? crawlerItemConfig.basePath + '/create'}>
                                <Plus className="size-4" />
                                Add Item
                            </Link>
                        </Button>
                    );
                }}
                queryFn={async (request) => {
                    const response = await http.get(buildCrawlerItemIndexUrl(request, sourceId));

                    return normalizeCrawlerItemIndexResponse(response.data);
                }}
            />

            <Dialog open={Boolean(crawlTarget)} onOpenChange={(open) => !open && setCrawlTarget(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Crawl item?</DialogTitle>
                        <DialogDescription>Crawler item #{crawlTarget?.id} will be dispatched to the crawler service.</DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setCrawlTarget(null)}>Cancel</Button>
                        <Button className="gap-2 bg-blue-600 text-white hover:bg-blue-700" disabled={!crawlTarget || crawlingId === crawlTarget?.id} onClick={() => crawlTarget && void crawlItem(crawlTarget)}>
                            <Play className="size-4" />
                            Crawl
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete crawler item?</DialogTitle>
                        <DialogDescription>This action cannot be undone. Crawler item #{deleteTarget?.id} will be permanently deleted.</DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
                        <Button variant="destructive" disabled={!deleteTarget || deletingId === deleteTarget?.id} onClick={() => deleteTarget && void deleteItem(deleteTarget)}>
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={Boolean(bulkTarget)} onOpenChange={(open) => !open && setBulkTarget(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Crawl selected items?</DialogTitle>
                        <DialogDescription>{bulkTarget?.items.length ?? 0} selected item(s) will be dispatched to crawler service.</DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setBulkTarget(null)}>Cancel</Button>
                        <Button className="gap-2 bg-blue-600 text-white hover:bg-blue-700" disabled={!bulkTarget || bulkCrawling} onClick={() => bulkTarget && void crawlSelectedItems(bulkTarget.items, bulkTarget.resetSelection)}>
                            <Bot className="size-4" />
                            Crawl selected
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={Boolean(bulkDeleteTarget)} onOpenChange={(open) => !open && setBulkDeleteTarget(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete selected crawler items?</DialogTitle>
                        <DialogDescription>This action cannot be undone. {bulkDeleteTarget?.items.length ?? 0} selected crawler item(s) will be permanently deleted.</DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setBulkDeleteTarget(null)}>Cancel</Button>
                        <Button variant="destructive" disabled={!bulkDeleteTarget || bulkDeleting} onClick={() => bulkDeleteTarget && void deleteSelectedItems(bulkDeleteTarget.items, bulkDeleteTarget.resetSelection)}>
                            Delete selected
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
