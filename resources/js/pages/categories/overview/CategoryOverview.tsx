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
import { categoryConfig, type Category } from '../shema';
import { getCategoryColumns } from './columns';
import { buildCategoryIndexUrl, categoryDateRangeFilter, categoryFacetedFilters, normalizeCategoryIndexResponse } from './filters';
import { defaultCategorySorting } from './sorting';

export default function CategoryOverview() {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [bulkDeleting, setBulkDeleting] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
    const [bulkDeleteTarget, setBulkDeleteTarget] = useState<{ categories: Category[]; resetSelection: () => void } | null>(null);

    const deleteCategory = useCallback(async (category: Category) => {
        setDeletingId(category.id);

        try {
            await http.delete(`/categories/${category.id}`);
            toast({
                title: 'delete category successfully',
                description: 'category has been deleted.',
            });
            await queryClient.invalidateQueries({ queryKey: ['categories'] });
        } catch {
            toast({
                title: 'delete category failed',
                description: 'Something went wrong',
                variant: 'destructive',
            });
        } finally {
            setDeletingId(null);
            setDeleteTarget(null);
        }
    }, [queryClient, toast]);

    const deleteSelectedCategories = useCallback(async (categories: Category[], resetSelection: () => void) => {
        if (!categories.length) {
            return;
        }

        setBulkDeleting(true);

        const results = await Promise.allSettled(categories.map((category) => http.delete(`/categories/${category.id}`)));
        const failed = results.filter((result) => result.status === 'rejected').length;
        const deleted = categories.length - failed;

        if (deleted > 0) {
            toast({
                title: 'delete categories successfully',
                description: `${deleted} category(ies) have been deleted.`,
            });
        }

        if (failed > 0) {
            toast({
                title: 'delete categories failed',
                description: `${failed} category(ies) could not be deleted.`,
                variant: 'destructive',
            });
        }

        resetSelection();
        await queryClient.invalidateQueries({ queryKey: ['categories'] });
        setBulkDeleting(false);
        setBulkDeleteTarget(null);
    }, [queryClient, toast]);

    const columns = useMemo(
        () => getCategoryColumns({ deletingId, onDelete: deleteCategory, onRequestDelete: setDeleteTarget }),
        [deleteCategory, deletingId],
    );

    return (
        <AppLayout breadcrumbs={categoryConfig.breadcrumbs}>
            <Head title={categoryConfig.title} />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-auto p-4 md:p-6">
                <DataTableV1
                    title={categoryConfig.title}
                    columns={columns}
                    queryKey={['categories']}
                    searchPlaceholder="Search categories"
                    initialSorting={defaultCategorySorting}
                    facetedFilters={categoryFacetedFilters}
                    dateRangeFilter={categoryDateRangeFilter}
                    actions={({ selectedRows, table }) => {
                        const selectedCategories = selectedRows.map((row) => row.original);

                        return (
                            <>
                                {selectedCategories.length > 0 ? (
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        className="gap-2"
                                        disabled={bulkDeleting}
                                        onClick={() => setBulkDeleteTarget({ categories: selectedCategories, resetSelection: () => table.resetRowSelection() })}
                                    >
                                        <Trash2 className="size-4" />
                                        Delete selected ({selectedCategories.length})
                                    </Button>
                                ) : null}
                                <Button asChild size="sm" className="gap-2 bg-blue-600 text-white hover:bg-blue-700">
                                    <Link href={`${categoryConfig.basePath}/create`}>
                                        <Plus className="size-4" />
                                        Add Category
                                    </Link>
                                </Button>
                            </>
                        );
                    }}
                    queryFn={async (request) => {
                        const response = await http.get(buildCategoryIndexUrl(request).replace('/api', ''));

                        return normalizeCategoryIndexResponse(response.data);
                    }}
                />

                <Dialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Delete category?</DialogTitle>
                            <DialogDescription>
                                This action cannot be undone. Category #{deleteTarget?.id} will be permanently deleted.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
                                Cancel
                            </Button>
                            <Button variant="destructive" disabled={!deleteTarget || deletingId === deleteTarget?.id} onClick={() => deleteTarget && void deleteCategory(deleteTarget)}>
                                Delete
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <Dialog open={Boolean(bulkDeleteTarget)} onOpenChange={(open) => !open && setBulkDeleteTarget(null)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Delete selected categories?</DialogTitle>
                            <DialogDescription>
                                This action cannot be undone. {bulkDeleteTarget?.categories.length ?? 0} selected category(ies) will be permanently deleted.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setBulkDeleteTarget(null)}>
                                Cancel
                            </Button>
                            <Button
                                variant="destructive"
                                disabled={!bulkDeleteTarget || bulkDeleting}
                                onClick={() => bulkDeleteTarget && void deleteSelectedCategories(bulkDeleteTarget.categories, bulkDeleteTarget.resetSelection)}
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
