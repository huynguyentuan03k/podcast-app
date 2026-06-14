import { DataTableV1 } from '@/components/custom/data-table-v1';
import { PageTransition, TransitionLink } from '@/components/custom/page-transition';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/hooks/use-toast';
import http from '@/http/client';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@/lib/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2 } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { episodeConfig, type Episode } from '../shema';
import { getEpisodeColumns } from './columns';
import { buildEpisodeIndexUrl, episodeDateRangeFilter, episodeFacetedFilters, normalizeEpisodeIndexResponse } from './filters';
import { defaultEpisodeSorting } from './sorting';

export default function EpisodeOverview() {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [bulkDeleting, setBulkDeleting] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<Episode | null>(null);
    const [bulkDeleteTarget, setBulkDeleteTarget] = useState<{ episodes: Episode[]; resetSelection: () => void } | null>(null);

    const deleteEpisode = useCallback(async (episode: Episode) => {
        setDeletingId(episode.id);

        try {
            await http.delete(`/episodes/${episode.id}`);
            toast({ title: 'delete episode successfully', description: 'episode has been deleted.' });
            await queryClient.invalidateQueries({ queryKey: ['episodes'] });
        } catch {
            toast({ title: 'delete episode failed', description: 'Something went wrong', variant: 'destructive' });
        } finally {
            setDeletingId(null);
            setDeleteTarget(null);
        }
    }, [queryClient, toast]);

    const deleteSelectedEpisodes = useCallback(async (episodes: Episode[], resetSelection: () => void) => {
        if (!episodes.length) {
            return;
        }

        setBulkDeleting(true);

        const results = await Promise.allSettled(episodes.map((episode) => http.delete(`/episodes/${episode.id}`)));
        const failed = results.filter((result) => result.status === 'rejected').length;
        const deleted = episodes.length - failed;

        if (deleted > 0) {
            toast({ title: 'delete episodes successfully', description: `${deleted} episode(s) have been deleted.` });
        }

        if (failed > 0) {
            toast({ title: 'delete episodes failed', description: `${failed} episode(s) could not be deleted.`, variant: 'destructive' });
        }

        resetSelection();
        await queryClient.invalidateQueries({ queryKey: ['episodes'] });
        setBulkDeleting(false);
        setBulkDeleteTarget(null);
    }, [queryClient, toast]);

    const columns = useMemo(
        () => getEpisodeColumns({ deletingId, onDelete: deleteEpisode, onRequestDelete: setDeleteTarget }),
        [deleteEpisode, deletingId],
    );

    return (
        <AppLayout breadcrumbs={episodeConfig.breadcrumbs}>
            <Head title={episodeConfig.title} />
            <PageTransition className="flex h-full flex-1 flex-col gap-6 overflow-auto p-4 md:p-6">
                <DataTableV1
                    title={episodeConfig.title}
                    columns={columns}
                    queryKey={['episodes']}
                    searchPlaceholder="Search episodes"
                    initialSorting={defaultEpisodeSorting}
                    facetedFilters={episodeFacetedFilters}
                    dateRangeFilter={episodeDateRangeFilter}
                    actions={({ selectedRows, table }) => {
                        const selectedEpisodes = selectedRows.map((row) => row.original);

                        return (
                            <>
                                {selectedEpisodes.length > 0 ? (
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        className="gap-2"
                                        disabled={bulkDeleting}
                                        onClick={() => setBulkDeleteTarget({ episodes: selectedEpisodes, resetSelection: () => table.resetRowSelection() })}
                                    >
                                        <Trash2 className="size-4" />
                                        Delete selected ({selectedEpisodes.length})
                                    </Button>
                                ) : null}
                                <Button asChild size="sm" className="gap-2 bg-blue-600 text-white hover:bg-blue-700">
                                    <TransitionLink href={`${episodeConfig.basePath}/create`}>
                                        <Plus className="size-4" />
                                        Add Episode
                                    </TransitionLink>
                                </Button>
                            </>
                        );
                    }}
                    queryFn={async (request) => {
                        const response = await http.get(buildEpisodeIndexUrl(request).replace('/api', ''));

                        return normalizeEpisodeIndexResponse(response.data);
                    }}
                />

                <Dialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Delete episode?</DialogTitle>
                            <DialogDescription>
                                This action cannot be undone. Episode #{deleteTarget?.id} will be permanently deleted.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
                                Cancel
                            </Button>
                            <Button variant="destructive" disabled={!deleteTarget || deletingId === deleteTarget?.id} onClick={() => deleteTarget && void deleteEpisode(deleteTarget)}>
                                Delete
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <Dialog open={Boolean(bulkDeleteTarget)} onOpenChange={(open) => !open && setBulkDeleteTarget(null)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Delete selected episodes?</DialogTitle>
                            <DialogDescription>
                                This action cannot be undone. {bulkDeleteTarget?.episodes.length ?? 0} selected episode(s) will be permanently deleted.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setBulkDeleteTarget(null)}>
                                Cancel
                            </Button>
                            <Button
                                variant="destructive"
                                disabled={!bulkDeleteTarget || bulkDeleting}
                                onClick={() => bulkDeleteTarget && void deleteSelectedEpisodes(bulkDeleteTarget.episodes, bulkDeleteTarget.resetSelection)}
                            >
                                Delete selected
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </PageTransition>
        </AppLayout>
    );
}
