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
import { adminConfig, type Admin } from '../shema';
import { adminFacetedFilters, buildAdminIndexUrl, normalizeAdminIndexResponse } from './filters';
import { getAdminColumns } from './columns';
import { defaultAdminSorting } from './sorting';

export default function AdminOverview() {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [bulkDeleting, setBulkDeleting] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<Admin | null>(null);
    const [bulkDeleteTarget, setBulkDeleteTarget] = useState<{ admins: Admin[]; resetSelection: () => void } | null>(null);

    const deleteAdmin = useCallback(async (admin: Admin) => {
        setDeletingId(admin.id);

        try {
            await http.delete(`${adminConfig.apiPath}/${admin.id}`);
            toast({ title: 'delete admin successfully', description: 'admin has been deleted.' });
            await queryClient.invalidateQueries({ queryKey: ['admins'] });
        } catch {
            toast({ title: 'delete admin failed', description: 'Something went wrong', variant: 'destructive' });
        } finally {
            setDeletingId(null);
            setDeleteTarget(null);
        }
    }, [queryClient, toast]);

    const deleteSelectedAdmins = useCallback(async (admins: Admin[], resetSelection: () => void) => {
        if (!admins.length) return;

        setBulkDeleting(true);
        const results = await Promise.allSettled(admins.map((admin) => http.delete(`${adminConfig.apiPath}/${admin.id}`)));
        const failed = results.filter((result) => result.status === 'rejected').length;
        const deleted = admins.length - failed;

        if (deleted > 0) toast({ title: 'delete admins successfully', description: `${deleted} admin(s) have been deleted.` });
        if (failed > 0) toast({ title: 'delete admins failed', description: `${failed} admin(s) could not be deleted.`, variant: 'destructive' });

        resetSelection();
        await queryClient.invalidateQueries({ queryKey: ['admins'] });
        setBulkDeleting(false);
        setBulkDeleteTarget(null);
    }, [queryClient, toast]);

    const columns = useMemo(() => getAdminColumns({ deletingId, onRequestDelete: setDeleteTarget }), [deletingId]);

    return (
        <AppLayout breadcrumbs={adminConfig.breadcrumbs}>
            <Head title={adminConfig.title} />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-auto p-4 md:p-6">
                <DataTableV1
                    title={adminConfig.title}
                    columns={columns}
                    queryKey={['admins']}
                    searchPlaceholder="Search admins"
                    initialSorting={defaultAdminSorting}
                    facetedFilters={adminFacetedFilters}
                    actions={({ selectedRows, table }) => {
                        const selectedAdmins = selectedRows.map((row) => row.original);

                        return (
                            <>
                                {selectedAdmins.length > 0 ? (
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        className="gap-2"
                                        disabled={bulkDeleting}
                                        onClick={() => setBulkDeleteTarget({ admins: selectedAdmins, resetSelection: () => table.resetRowSelection() })}
                                    >
                                        <Trash2 className="size-4" />
                                        Delete selected ({selectedAdmins.length})
                                    </Button>
                                ) : null}
                                <Button asChild size="sm" className="gap-2 bg-blue-600 text-white hover:bg-blue-700">
                                    <Link href={`${adminConfig.basePath}/create`}>
                                        <Plus className="size-4" />
                                        Add Admin
                                    </Link>
                                </Button>
                            </>
                        );
                    }}
                    queryFn={async (request) => {
                        const response = await http.get(buildAdminIndexUrl(request).replace('/api', ''));

                        return normalizeAdminIndexResponse(response.data);
                    }}
                />

                <Dialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Delete admin?</DialogTitle>
                            <DialogDescription>This action cannot be undone. Admin #{deleteTarget?.id} will be permanently deleted.</DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
                            <Button variant="destructive" disabled={!deleteTarget || deletingId === deleteTarget?.id} onClick={() => deleteTarget && void deleteAdmin(deleteTarget)}>Delete</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <Dialog open={Boolean(bulkDeleteTarget)} onOpenChange={(open) => !open && setBulkDeleteTarget(null)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Delete selected admins?</DialogTitle>
                            <DialogDescription>This action cannot be undone. {bulkDeleteTarget?.admins.length ?? 0} selected admin(s) will be permanently deleted.</DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setBulkDeleteTarget(null)}>Cancel</Button>
                            <Button variant="destructive" disabled={!bulkDeleteTarget || bulkDeleting} onClick={() => bulkDeleteTarget && void deleteSelectedAdmins(bulkDeleteTarget.admins, bulkDeleteTarget.resetSelection)}>
                                Delete selected
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
