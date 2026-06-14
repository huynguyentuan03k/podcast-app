import { authorizeCheck } from '@/authorization';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import http from '@/http/client';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@/lib/navigation';
import { formatDateTime } from '@/lib/date-format';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { adminRoleConfig, type AdminRole } from '../shema';

function DetailItem({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="space-y-1">
            <p className="text-xs text-muted-foreground">{label}:</p>
            <div className="text-sm font-medium">{children || <span className="italic text-muted-foreground">Not available</span>}</div>
        </div>
    );
}

export default function ShowAdminRole({ record }: { record: AdminRole }) {
    const navigate = useNavigate();
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const members = record.admin_users ?? [];
    const canUpdate = authorizeCheck('UPDATE_ROLE');
    const canDelete = authorizeCheck('DELETE_ROLE');

    const deleteMutation = useMutation({
        mutationFn: () => http.delete(`${adminRoleConfig.apiPath}/${record.id}`),
        onSuccess: async () => {
            toast({ title: 'delete admin role successfully', description: 'admin role has been deleted.' });
            await queryClient.invalidateQueries({ queryKey: ['admin-roles'] });
            navigate(adminRoleConfig.basePath);
        },
        onError: () => {
            toast({ title: 'delete admin role failed', description: 'Something went wrong', variant: 'destructive' });
        },
    });

    return (
        <AppLayout breadcrumbs={[...adminRoleConfig.breadcrumbs, { title: `ID: ${record.id}`, href: '#' }]}>
            <Head title={`Admin Role #${record.id}`} />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-auto p-4 md:p-6">
                <div className="flex items-start justify-between gap-4">
                    <h1 className="text-2xl font-semibold">Show Portal Role (ID: {record.id})</h1>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" className="gap-2 shadow-sm" onClick={() => navigate(-1)}>
                            <ArrowLeft className="size-4" />
                            Back
                        </Button>
                        {canDelete ? (
                            <Button variant="destructive" className="gap-2 shadow-sm" disabled={deleteMutation.isPending} onClick={() => deleteMutation.mutate()}>
                                <Trash2 className="size-4" />
                                Delete
                            </Button>
                        ) : null}
                        {canUpdate ? (
                            <Button asChild className="gap-2 bg-blue-600 text-white shadow-sm hover:bg-blue-700 focus-visible:ring-blue-500">
                                <Link href={`${adminRoleConfig.basePath}/${record.id}/edit`}>
                                    <Pencil className="size-4" />
                                    Edit
                                </Link>
                            </Button>
                        ) : null}
                    </div>
                </div>

                <div className="rounded-lg border bg-card p-6 shadow-sm">
                    <h2 className="mb-8 text-base font-semibold">Portal Role Information</h2>
                    <div className="grid gap-x-24 gap-y-10 md:grid-cols-2 xl:grid-cols-3">
                        <DetailItem label="Role Name">{record.display_name ?? record.name}</DetailItem>
                        <DetailItem label="Last Update">{formatDateTime(record.updated_at)}</DetailItem>
                        <div className="space-y-2 md:col-span-2 xl:col-span-3">
                            <p className="text-xs text-muted-foreground">Permissions:</p>
                            <div className="flex flex-wrap gap-2">
                                {(record.permissions ?? []).length ? record.permissions?.map((permission) => <Badge key={permission} variant="outline">{permission}</Badge>) : <span className="text-sm italic text-muted-foreground">Not available</span>}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="rounded-lg border bg-card p-6 shadow-sm">
                    <h2 className="mb-8 text-base font-semibold">Portal Role Members</h2>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-40">User ID</TableHead>
                                    <TableHead>Full Name</TableHead>
                                    <TableHead>Email</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {members.length ? (
                                    members.map((member) => (
                                        <TableRow key={member.id}>
                                            <TableCell>{member.id}</TableCell>
                                            <TableCell className="font-medium">{member.username ?? '-'}</TableCell>
                                            <TableCell>{member.email ?? '-'}</TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                                            No role members found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
