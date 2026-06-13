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
import { authorConfig, type Author } from '../shema';
import { authorDateRangeFilter, authorFacetedFilters, buildAuthorIndexUrl, normalizeAuthorIndexResponse } from './filters';
import { getAuthorColumns } from './columns';
import { defaultAuthorSorting } from './sorting';

export default function AuthorOverview() {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [bulkDeleting, setBulkDeleting] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<Author | null>(null);
    const [bulkDeleteTarget, setBulkDeleteTarget] = useState<{ authors: Author[]; resetSelection: () => void } | null>(null);

    const deleteAuthor = useCallback(async (author: Author) => {
        setDeletingId(author.id);

        try {
            await http.delete(`/authors/${author.id}`);
            toast({
                title: 'delete author successfully',
                description: 'author has been deleted.',
            });
            await queryClient.invalidateQueries({ queryKey: ['authors'] });
        } catch {
            toast({
                title: 'delete author failed',
                description: 'Something went wrong',
                variant: 'destructive',
            });
        } finally {
            setDeletingId(null);
            setDeleteTarget(null);
        }
    }, [queryClient, toast]);

    const deleteSelectedAuthors = useCallback(async (authors: Author[], resetSelection: () => void) => {
        if (!authors.length) {
            return;
        }

        setBulkDeleting(true);

        const results = await Promise.allSettled(authors.map((author) => http.delete(`/authors/${author.id}`)));
        const failed = results.filter((result) => result.status === 'rejected').length;
        const deleted = authors.length - failed;

        if (deleted > 0) {
            toast({
                title: 'delete authors successfully',
                description: `${deleted} author(s) have been deleted.`,
            });
        }

        if (failed > 0) {
            toast({
                title: 'delete authors failed',
                description: `${failed} author(s) could not be deleted.`,
                variant: 'destructive',
            });
        }

        resetSelection();
        await queryClient.invalidateQueries({ queryKey: ['authors'] });
        setBulkDeleting(false);
        setBulkDeleteTarget(null);
    }, [queryClient, toast]);

    const columns = useMemo(
        () => getAuthorColumns({ deletingId, onDelete: deleteAuthor, onRequestDelete: setDeleteTarget }),
        [deleteAuthor, deletingId],
    );

    return (
        <AppLayout breadcrumbs={authorConfig.breadcrumbs}>
            <Head title={authorConfig.title} />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-auto p-4 md:p-6">
                <DataTableV1
                    title={authorConfig.title}
                    columns={columns}
                    queryKey={['authors']}
                    searchPlaceholder="Search authors"
                    initialSorting={defaultAuthorSorting}
                    facetedFilters={authorFacetedFilters}
                    dateRangeFilter={authorDateRangeFilter}
                    actions={({ selectedRows, table }) => {
                        const selectedAuthors = selectedRows.map((row) => row.original);

                        return (
                            <>
                                {selectedAuthors.length > 0 ? (
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        className="gap-2"
                                        disabled={bulkDeleting}
                                        onClick={() => setBulkDeleteTarget({ authors: selectedAuthors, resetSelection: () => table.resetRowSelection() })}
                                    >
                                        <Trash2 className="size-4" />
                                        Delete selected ({selectedAuthors.length})
                                    </Button>
                                ) : null}
                                <Button asChild size="sm" className="gap-2 bg-blue-600 text-white hover:bg-blue-700">
                                    <Link href={`${authorConfig.basePath}/create`}>
                                        <Plus className="size-4" />
                                        Add Author
                                    </Link>
                                </Button>
                            </>
                        );
                    }}
                    queryFn={async (request) => {
                        const response = await http.get(buildAuthorIndexUrl(request).replace('/api', ''));

                        return normalizeAuthorIndexResponse(response.data);
                    }}
                />

                <Dialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Delete author?</DialogTitle>
                            <DialogDescription>
                                This action cannot be undone. Author #{deleteTarget?.id} will be permanently deleted.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
                                Cancel
                            </Button>
                            <Button variant="destructive" disabled={!deleteTarget || deletingId === deleteTarget?.id} onClick={() => deleteTarget && void deleteAuthor(deleteTarget)}>
                                Delete
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <Dialog open={Boolean(bulkDeleteTarget)} onOpenChange={(open) => !open && setBulkDeleteTarget(null)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Delete selected authors?</DialogTitle>
                            <DialogDescription>
                                This action cannot be undone. {bulkDeleteTarget?.authors.length ?? 0} selected author(s) will be permanently deleted.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setBulkDeleteTarget(null)}>
                                Cancel
                            </Button>
                            <Button
                                variant="destructive"
                                disabled={!bulkDeleteTarget || bulkDeleting}
                                onClick={() => bulkDeleteTarget && void deleteSelectedAuthors(bulkDeleteTarget.authors, bulkDeleteTarget.resetSelection)}
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
