import { authorizeCheck } from '@/authorization';
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
import { adminRoleConfig, type AdminRole } from '../shema';
import { adminRoleFacetedFilters, buildAdminRoleIndexUrl, normalizeAdminRoleIndexResponse } from './filters';
import { getAdminRoleColumns } from './columns';
import { defaultAdminRoleSorting } from './sorting';

export default function AdminRoleOverview() {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [bulkDeleting, setBulkDeleting] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<AdminRole | null>(null);
    const [bulkDeleteTarget, setBulkDeleteTarget] = useState<{ roles: AdminRole[]; resetSelection: () => void } | null>(null);
    const canCreate = authorizeCheck('CREATE_ROLE');
    const canDelete = authorizeCheck('DELETE_ROLE');

    const deleteRole = useCallback(async (role: AdminRole) => {
        setDeletingId(role.id);

        try {
            await http.delete(`${adminRoleConfig.apiPath}/${role.id}`);
            toast({ title: 'delete admin role successfully', description: 'admin role has been deleted.' });
            await queryClient.invalidateQueries({ queryKey: ['admin-roles'] });
        } catch {
            toast({ title: 'delete admin role failed', description: 'Something went wrong', variant: 'destructive' });
        } finally {
            setDeletingId(null);
            setDeleteTarget(null);
        }
    }, [queryClient, toast]);

    const deleteSelectedRoles = useCallback(async (roles: AdminRole[], resetSelection: () => void) => {
        if (!roles.length) return;

        setBulkDeleting(true);
        const results = await Promise.allSettled(roles.map((role) => http.delete(`${adminRoleConfig.apiPath}/${role.id}`)));
        const failed = results.filter((result) => result.status === 'rejected').length;
        const deleted = roles.length - failed;

        if (deleted > 0) toast({ title: 'delete admin roles successfully', description: `${deleted} admin role(s) have been deleted.` });
        if (failed > 0) toast({ title: 'delete admin roles failed', description: `${failed} admin role(s) could not be deleted.`, variant: 'destructive' });

        resetSelection();
        await queryClient.invalidateQueries({ queryKey: ['admin-roles'] });
        setBulkDeleting(false);
        setBulkDeleteTarget(null);
    }, [queryClient, toast]);

    const columns = useMemo(() => getAdminRoleColumns({ deletingId, onRequestDelete: setDeleteTarget }), [deletingId]);

    return (
        <AppLayout breadcrumbs={adminRoleConfig.breadcrumbs}>
            <Head title={adminRoleConfig.title} />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-auto p-4 md:p-6">
                <DataTableV1
                    title={adminRoleConfig.title}
                    columns={columns}
                    queryKey={['admin-roles']}
                    searchPlaceholder="Search admin roles"
                    initialSorting={defaultAdminRoleSorting}
                    facetedFilters={adminRoleFacetedFilters}
                    actions={({ selectedRows, table }) => {
                        const selectedRoles = selectedRows.map((row) => row.original);

                        return (
                            <>
                                {canDelete && selectedRoles.length > 0 ? (
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        className="gap-2"
                                        disabled={bulkDeleting}
                                        onClick={() => setBulkDeleteTarget({ roles: selectedRoles, resetSelection: () => table.resetRowSelection() })}
                                    >
                                        <Trash2 className="size-4" />
                                        Delete selected ({selectedRoles.length})
                                    </Button>
                                ) : null}
                                {canCreate ? (
                                    <Button asChild size="sm" className="gap-2 bg-blue-600 text-white hover:bg-blue-700">
                                        <Link href={`${adminRoleConfig.basePath}/create`}>
                                            <Plus className="size-4" />
                                            Add Admin Role
                                        </Link>
                                    </Button>
                                ) : null}
                            </>
                        );
                    }}
                    queryFn={async (request) => {
                        const response = await http.get(buildAdminRoleIndexUrl(request).replace('/api', ''));

                        return normalizeAdminRoleIndexResponse(response.data);
                    }}
                />

                <Dialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Delete admin role?</DialogTitle>
                            <DialogDescription>This action cannot be undone. Admin role #{deleteTarget?.id} will be permanently deleted.</DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
                            <Button variant="destructive" disabled={!deleteTarget || deletingId === deleteTarget?.id} onClick={() => deleteTarget && void deleteRole(deleteTarget)}>Delete</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <Dialog open={Boolean(bulkDeleteTarget)} onOpenChange={(open) => !open && setBulkDeleteTarget(null)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Delete selected admin roles?</DialogTitle>
                            <DialogDescription>This action cannot be undone. {bulkDeleteTarget?.roles.length ?? 0} selected admin role(s) will be permanently deleted.</DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setBulkDeleteTarget(null)}>Cancel</Button>
                            <Button variant="destructive" disabled={!bulkDeleteTarget || bulkDeleting} onClick={() => bulkDeleteTarget && void deleteSelectedRoles(bulkDeleteTarget.roles, bulkDeleteTarget.resetSelection)}>
                                Delete selected
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
