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
import { publisherConfig, type Publisher } from '../shema';
import { getPublisherColumns } from './columns';
import { buildPublisherIndexUrl, normalizePublisherIndexResponse, publisherDateRangeFilter, publisherFacetedFilters } from './filters';
import { defaultPublisherSorting } from './sorting';

export default function PublisherOverview() {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [bulkDeleting, setBulkDeleting] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<Publisher | null>(null);
    const [bulkDeleteTarget, setBulkDeleteTarget] = useState<{ publishers: Publisher[]; resetSelection: () => void } | null>(null);

    const deletePublisher = useCallback(async (publisher: Publisher) => {
        setDeletingId(publisher.id);

        try {
            await http.delete(`/publishers/${publisher.id}`);
            toast({ title: 'delete publisher successfully', description: 'publisher has been deleted.' });
            await queryClient.invalidateQueries({ queryKey: ['publishers'] });
        } catch {
            toast({ title: 'delete publisher failed', description: 'Something went wrong', variant: 'destructive' });
        } finally {
            setDeletingId(null);
            setDeleteTarget(null);
        }
    }, [queryClient, toast]);

    const deleteSelectedPublishers = useCallback(async (publishers: Publisher[], resetSelection: () => void) => {
        if (!publishers.length) {
            return;
        }

        setBulkDeleting(true);

        const results = await Promise.allSettled(publishers.map((publisher) => http.delete(`/publishers/${publisher.id}`)));
        const failed = results.filter((result) => result.status === 'rejected').length;
        const deleted = publishers.length - failed;

        if (deleted > 0) {
            toast({ title: 'delete publishers successfully', description: `${deleted} publisher(s) have been deleted.` });
        }

        if (failed > 0) {
            toast({ title: 'delete publishers failed', description: `${failed} publisher(s) could not be deleted.`, variant: 'destructive' });
        }

        resetSelection();
        await queryClient.invalidateQueries({ queryKey: ['publishers'] });
        setBulkDeleting(false);
        setBulkDeleteTarget(null);
    }, [queryClient, toast]);

    const columns = useMemo(
        () => getPublisherColumns({ deletingId, onDelete: deletePublisher, onRequestDelete: setDeleteTarget }),
        [deletePublisher, deletingId],
    );

    return (
        <AppLayout breadcrumbs={publisherConfig.breadcrumbs}>
            <Head title={publisherConfig.title} />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-auto p-4 md:p-6">
                <DataTableV1
                    title={publisherConfig.title}
                    columns={columns}
                    queryKey={['publishers']}
                    searchPlaceholder="Search publishers"
                    initialSorting={defaultPublisherSorting}
                    facetedFilters={publisherFacetedFilters}
                    dateRangeFilter={publisherDateRangeFilter}
                    actions={({ selectedRows, table }) => {
                        const selectedPublishers = selectedRows.map((row) => row.original);

                        return (
                            <>
                                {selectedPublishers.length > 0 ? (
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        className="gap-2"
                                        disabled={bulkDeleting}
                                        onClick={() => setBulkDeleteTarget({ publishers: selectedPublishers, resetSelection: () => table.resetRowSelection() })}
                                    >
                                        <Trash2 className="size-4" />
                                        Delete selected ({selectedPublishers.length})
                                    </Button>
                                ) : null}
                                <Button asChild size="sm" className="gap-2 bg-blue-600 text-white hover:bg-blue-700">
                                    <Link href={`${publisherConfig.basePath}/create`}>
                                        <Plus className="size-4" />
                                        Add Publisher
                                    </Link>
                                </Button>
                            </>
                        );
                    }}
                    queryFn={async (request) => {
                        const response = await http.get(buildPublisherIndexUrl(request).replace('/api', ''));

                        return normalizePublisherIndexResponse(response.data);
                    }}
                />

                <Dialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Delete publisher?</DialogTitle>
                            <DialogDescription>
                                This action cannot be undone. Publisher #{deleteTarget?.id} will be permanently deleted.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
                                Cancel
                            </Button>
                            <Button variant="destructive" disabled={!deleteTarget || deletingId === deleteTarget?.id} onClick={() => deleteTarget && void deletePublisher(deleteTarget)}>
                                Delete
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <Dialog open={Boolean(bulkDeleteTarget)} onOpenChange={(open) => !open && setBulkDeleteTarget(null)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Delete selected publishers?</DialogTitle>
                            <DialogDescription>
                                This action cannot be undone. {bulkDeleteTarget?.publishers.length ?? 0} selected publisher(s) will be permanently deleted.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setBulkDeleteTarget(null)}>
                                Cancel
                            </Button>
                            <Button
                                variant="destructive"
                                disabled={!bulkDeleteTarget || bulkDeleting}
                                onClick={() => bulkDeleteTarget && void deleteSelectedPublishers(bulkDeleteTarget.publishers, bulkDeleteTarget.resetSelection)}
                            >
                                Delete selected
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
