import { DataTableV1 } from '@/components/custom/data-table-v1';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/hooks/use-toast';
import http from '@/http/client';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@/lib/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2 } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { crawlerSourceConfig, type CrawlerSource } from '../shema';
import { getCrawlerSourceColumns } from './columns';
import { buildCrawlerSourceIndexUrl, crawlerSourceDateRangeFilter, crawlerSourceFacetedFilters, normalizeCrawlerSourceIndexResponse } from './filters';
import { defaultCrawlerSourceSorting } from './sorting';

export default function CrawlerSourceOverview() {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [bulkDeleting, setBulkDeleting] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<CrawlerSource | null>(null);
    const [bulkDeleteTarget, setBulkDeleteTarget] = useState<{ sources: CrawlerSource[]; resetSelection: () => void } | null>(null);

    const deleteSource = useCallback(async (source: CrawlerSource) => {
        setDeletingId(source.id);
        try {
            await http.delete(`/frieren-crawler/admin/sources/${source.id}`);
            toast({ title: 'delete crawler source successfully', description: 'crawler source has been deleted.' });
            await queryClient.invalidateQueries({ queryKey: ['crawler-sources'] });
        } catch {
            toast({ title: 'delete crawler source failed', description: 'Something went wrong', variant: 'destructive' });
        } finally {
            setDeletingId(null);
            setDeleteTarget(null);
        }
    }, [queryClient, toast]);

    const deleteSelectedSources = useCallback(async (sources: CrawlerSource[], resetSelection: () => void) => {
        if (!sources.length) return;
        setBulkDeleting(true);
        const results = await Promise.allSettled(sources.map((source) => http.delete(`/frieren-crawler/admin/sources/${source.id}`)));
        const failed = results.filter((result) => result.status === 'rejected').length;
        const deleted = sources.length - failed;
        if (deleted > 0) toast({ title: 'delete crawler sources successfully', description: `${deleted} crawler source(s) have been deleted.` });
        if (failed > 0) toast({ title: 'delete crawler sources failed', description: `${failed} crawler source(s) could not be deleted.`, variant: 'destructive' });
        resetSelection();
        await queryClient.invalidateQueries({ queryKey: ['crawler-sources'] });
        setBulkDeleting(false);
        setBulkDeleteTarget(null);
    }, [queryClient, toast]);

    const columns = useMemo(() => getCrawlerSourceColumns({ deletingId, onRequestDelete: setDeleteTarget }), [deletingId]);

    return (
        <AppLayout breadcrumbs={crawlerSourceConfig.breadcrumbs}>
            <Head title={crawlerSourceConfig.title} />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-auto p-4 md:p-6">
                <DataTableV1
                    title={crawlerSourceConfig.title}
                    columns={columns}
                    queryKey={['crawler-sources']}
                    searchPlaceholder="Search crawler sources"
                    initialSorting={defaultCrawlerSourceSorting}
                    facetedFilters={crawlerSourceFacetedFilters}
                    dateRangeFilter={crawlerSourceDateRangeFilter}
                    actions={({ selectedRows, table }) => {
                        const selectedSources = selectedRows.map((row) => row.original);
                        return (
                            <>
                                {selectedSources.length > 0 ? (
                                    <Button variant="destructive" size="sm" className="gap-2" disabled={bulkDeleting} onClick={() => setBulkDeleteTarget({ sources: selectedSources, resetSelection: () => table.resetRowSelection() })}>
                                        <Trash2 className="size-4" />
                                        Delete selected ({selectedSources.length})
                                    </Button>
                                ) : null}
                                <Button asChild size="sm" className="gap-2 bg-blue-600 text-white hover:bg-blue-700">
                                    <Link href={`${crawlerSourceConfig.basePath}/create`}>
                                        <Plus className="size-4" />
                                        Add Crawler Source
                                    </Link>
                                </Button>
                            </>
                        );
                    }}
                    queryFn={async (request) => {
                        const response = await http.get(buildCrawlerSourceIndexUrl(request).replace('/api', ''));
                        return normalizeCrawlerSourceIndexResponse(response.data);
                    }}
                />

                <Dialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Delete crawler source?</DialogTitle>
                            <DialogDescription>This action cannot be undone. Source #{deleteTarget?.id} will be permanently deleted.</DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
                            <Button variant="destructive" disabled={!deleteTarget || deletingId === deleteTarget?.id} onClick={() => deleteTarget && void deleteSource(deleteTarget)}>Delete</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <Dialog open={Boolean(bulkDeleteTarget)} onOpenChange={(open) => !open && setBulkDeleteTarget(null)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Delete selected crawler sources?</DialogTitle>
                            <DialogDescription>This action cannot be undone. {bulkDeleteTarget?.sources.length ?? 0} selected source(s) will be permanently deleted.</DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setBulkDeleteTarget(null)}>Cancel</Button>
                            <Button variant="destructive" disabled={!bulkDeleteTarget || bulkDeleting} onClick={() => bulkDeleteTarget && void deleteSelectedSources(bulkDeleteTarget.sources, bulkDeleteTarget.resetSelection)}>Delete selected</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
