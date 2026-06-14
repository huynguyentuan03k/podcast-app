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
import { userConfig, type User } from '../shema';
import { getUserColumns } from './columns';
import { buildUserIndexUrl, normalizeUserIndexResponse, userDateRangeFilter, userFacetedFilters } from './filters';
import { defaultUserSorting } from './sorting';

export default function UserOverview() {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [bulkDeleting, setBulkDeleting] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
    const [bulkDeleteTarget, setBulkDeleteTarget] = useState<{ users: User[]; resetSelection: () => void } | null>(null);

    const deleteUser = useCallback(async (user: User) => {
        setDeletingId(user.id);

        try {
            await http.delete(`/users/${user.id}`);
            toast({ title: 'delete user successfully', description: 'user has been deleted.' });
            await queryClient.invalidateQueries({ queryKey: ['users'] });
        } catch {
            toast({ title: 'delete user failed', description: 'Something went wrong', variant: 'destructive' });
        } finally {
            setDeletingId(null);
            setDeleteTarget(null);
        }
    }, [queryClient, toast]);

    const deleteSelectedUsers = useCallback(async (users: User[], resetSelection: () => void) => {
        if (!users.length) return;

        setBulkDeleting(true);
        const results = await Promise.allSettled(users.map((user) => http.delete(`/users/${user.id}`)));
        const failed = results.filter((result) => result.status === 'rejected').length;
        const deleted = users.length - failed;

        if (deleted > 0) toast({ title: 'delete users successfully', description: `${deleted} user(s) have been deleted.` });
        if (failed > 0) toast({ title: 'delete users failed', description: `${failed} user(s) could not be deleted.`, variant: 'destructive' });

        resetSelection();
        await queryClient.invalidateQueries({ queryKey: ['users'] });
        setBulkDeleting(false);
        setBulkDeleteTarget(null);
    }, [queryClient, toast]);

    const columns = useMemo(() => getUserColumns({ deletingId, onRequestDelete: setDeleteTarget }), [deletingId]);

    return (
        <AppLayout breadcrumbs={userConfig.breadcrumbs}>
            <Head title={userConfig.title} />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-auto p-4 md:p-6">
                <DataTableV1
                    title={userConfig.title}
                    columns={columns}
                    queryKey={['users']}
                    searchPlaceholder="Search end users"
                    initialSorting={defaultUserSorting}
                    facetedFilters={userFacetedFilters}
                    dateRangeFilter={userDateRangeFilter}
                    actions={({ selectedRows, table }) => {
                        const selectedUsers = selectedRows.map((row) => row.original);

                        return (
                            <>
                                {selectedUsers.length > 0 ? (
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        className="gap-2"
                                        disabled={bulkDeleting}
                                        onClick={() => setBulkDeleteTarget({ users: selectedUsers, resetSelection: () => table.resetRowSelection() })}
                                    >
                                        <Trash2 className="size-4" />
                                        Delete selected ({selectedUsers.length})
                                    </Button>
                                ) : null}
                                <Button asChild size="sm" className="gap-2 bg-blue-600 text-white hover:bg-blue-700">
                                    <Link href={`${userConfig.basePath}/create`}>
                                        <Plus className="size-4" />
                                        Add User
                                    </Link>
                                </Button>
                            </>
                        );
                    }}
                    queryFn={async (request) => {
                        const response = await http.get(buildUserIndexUrl(request).replace('/api', ''));

                        return normalizeUserIndexResponse(response.data);
                    }}
                />

                <Dialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Delete user?</DialogTitle>
                            <DialogDescription>This action cannot be undone. User #{deleteTarget?.id} will be permanently deleted.</DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
                            <Button variant="destructive" disabled={!deleteTarget || deletingId === deleteTarget?.id} onClick={() => deleteTarget && void deleteUser(deleteTarget)}>Delete</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <Dialog open={Boolean(bulkDeleteTarget)} onOpenChange={(open) => !open && setBulkDeleteTarget(null)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Delete selected users?</DialogTitle>
                            <DialogDescription>This action cannot be undone. {bulkDeleteTarget?.users.length ?? 0} selected user(s) will be permanently deleted.</DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setBulkDeleteTarget(null)}>Cancel</Button>
                            <Button variant="destructive" disabled={!bulkDeleteTarget || bulkDeleting} onClick={() => bulkDeleteTarget && void deleteSelectedUsers(bulkDeleteTarget.users, bulkDeleteTarget.resetSelection)}>
                                Delete selected
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
