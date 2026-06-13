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
import { podcastConfig, type Podcast } from '../shema';
import { getPodcastColumns } from './columns';
import { buildPodcastIndexUrl, normalizePodcastIndexResponse, podcastDateRangeFilter, podcastFacetedFilters } from './filters';
import { defaultPodcastSorting } from './sorting';

export default function PodcastOverview() {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [bulkDeleting, setBulkDeleting] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<Podcast | null>(null);
    const [bulkDeleteTarget, setBulkDeleteTarget] = useState<{ podcasts: Podcast[]; resetSelection: () => void } | null>(null);

    const deletePodcast = useCallback(async (podcast: Podcast) => {
        setDeletingId(podcast.id);

        try {
            await http.delete(`/podcasts/${podcast.id}`);
            toast({
                title: 'delete podcast successfully',
                description: 'podcast has been deleted.',
            });
            await queryClient.invalidateQueries({ queryKey: ['podcasts'] });
        } catch {
            toast({
                title: 'delete podcast failed',
                description: 'Something went wrong',
                variant: 'destructive',
            });
        } finally {
            setDeletingId(null);
            setDeleteTarget(null);
        }
    }, [queryClient, toast]);

    const deleteSelectedPodcasts = useCallback(async (podcasts: Podcast[], resetSelection: () => void) => {
        if (!podcasts.length) {
            return;
        }

        setBulkDeleting(true);

        const results = await Promise.allSettled(podcasts.map((podcast) => http.delete(`/podcasts/${podcast.id}`)));
        const failed = results.filter((result) => result.status === 'rejected').length;
        const deleted = podcasts.length - failed;

        if (deleted > 0) {
            toast({
                title: 'delete podcasts successfully',
                description: `${deleted} podcast(s) have been deleted.`,
            });
        }

        if (failed > 0) {
            toast({
                title: 'delete podcasts failed',
                description: `${failed} podcast(s) could not be deleted.`,
                variant: 'destructive',
            });
        }

        resetSelection();
        await queryClient.invalidateQueries({ queryKey: ['podcasts'] });
        setBulkDeleting(false);
        setBulkDeleteTarget(null);
    }, [queryClient, toast]);

    const columns = useMemo(
        () => getPodcastColumns({ deletingId, onDelete: deletePodcast, onRequestDelete: setDeleteTarget }),
        [deletePodcast, deletingId],
    );

    return (
        <AppLayout breadcrumbs={podcastConfig.breadcrumbs}>
            <Head title={podcastConfig.title} />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-auto p-4 md:p-6">
                <DataTableV1
                    title={podcastConfig.title}
                    columns={columns}
                    queryKey={['podcasts']}
                    searchPlaceholder="Search podcasts"
                    initialSorting={defaultPodcastSorting}
                    facetedFilters={podcastFacetedFilters}
                    dateRangeFilter={podcastDateRangeFilter}
                    actions={({ selectedRows, table }) => {
                        const selectedPodcasts = selectedRows.map((row) => row.original);

                        return (
                            <>
                                {selectedPodcasts.length > 0 ? (
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        className="gap-2"
                                        disabled={bulkDeleting}
                                        onClick={() => setBulkDeleteTarget({ podcasts: selectedPodcasts, resetSelection: () => table.resetRowSelection() })}
                                    >
                                        <Trash2 className="size-4" />
                                        Delete selected ({selectedPodcasts.length})
                                    </Button>
                                ) : null}
                                <Button asChild size="sm" className="gap-2 bg-blue-600 text-white hover:bg-blue-700">
                                    <Link href={`${podcastConfig.basePath}/create`}>
                                        <Plus className="size-4" />
                                        Add Podcast
                                    </Link>
                                </Button>
                            </>
                        );
                    }}
                    queryFn={async (request) => {
                        const response = await http.get(buildPodcastIndexUrl(request).replace('/api', ''));

                        return normalizePodcastIndexResponse(response.data);
                    }}
                />

                <Dialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Delete podcast?</DialogTitle>
                            <DialogDescription>
                                This action cannot be undone. Podcast #{deleteTarget?.id} will be permanently deleted.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
                                Cancel
                            </Button>
                            <Button variant="destructive" disabled={!deleteTarget || deletingId === deleteTarget?.id} onClick={() => deleteTarget && void deletePodcast(deleteTarget)}>
                                Delete
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <Dialog open={Boolean(bulkDeleteTarget)} onOpenChange={(open) => !open && setBulkDeleteTarget(null)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Delete selected podcasts?</DialogTitle>
                            <DialogDescription>
                                This action cannot be undone. {bulkDeleteTarget?.podcasts.length ?? 0} selected podcast(s) will be permanently deleted.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setBulkDeleteTarget(null)}>
                                Cancel
                            </Button>
                            <Button
                                variant="destructive"
                                disabled={!bulkDeleteTarget || bulkDeleting}
                                onClick={() => bulkDeleteTarget && void deleteSelectedPodcasts(bulkDeleteTarget.podcasts, bulkDeleteTarget.resetSelection)}
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
