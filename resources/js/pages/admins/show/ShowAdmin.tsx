import { authorizeCheck } from '@/authorization';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/hooks/use-toast';
import http from '@/http/client';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@/lib/navigation';
import { formatDateTime } from '@/lib/date-format';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { adminConfig, type Admin } from '../shema';

function DetailItem({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="space-y-1">
            <p className="text-xs text-muted-foreground">{label}:</p>
            <div className="text-sm font-medium">{children || <span className="italic text-muted-foreground">Not available</span>}</div>
        </div>
    );
}

export default function ShowAdmin({ record }: { record: Admin }) {
    const navigate = useNavigate();
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const canUpdate = authorizeCheck('UPDATE_ADMIN_USER');
    const canDelete = authorizeCheck('DELETE_ADMIN_USER');

    const deleteMutation = useMutation({
        mutationFn: () => http.delete(`${adminConfig.apiPath}/${record.id}`),
        onSuccess: async () => {
            toast({ title: 'delete admin successfully', description: 'admin has been deleted.' });
            await queryClient.invalidateQueries({ queryKey: ['admins'] });
            navigate(adminConfig.basePath);
        },
        onError: () => {
            toast({ title: 'delete admin failed', description: 'Something went wrong', variant: 'destructive' });
        },
    });

    return (
        <AppLayout breadcrumbs={[...adminConfig.breadcrumbs, { title: `ID: ${record.id}`, href: '#' }]}>
            <Head title={`Admin #${record.id}`} />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-auto p-4 md:p-6">
                <div className="flex items-start justify-between gap-4">
                    <h1 className="text-2xl font-semibold">Admin Details</h1>
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
                                <Link href={`${adminConfig.basePath}/${record.id}/edit`}>
                                    <Pencil className="size-4" />
                                    Edit
                                </Link>
                            </Button>
                        ) : null}
                    </div>
                </div>

                <div className="rounded-lg border bg-card p-6 shadow-sm">
                    <h2 className="mb-8 text-base font-semibold">General Information</h2>
                    <div className="grid gap-x-12 gap-y-8 md:grid-cols-2 xl:grid-cols-3">
                        <DetailItem label="ID">{record.id}</DetailItem>
                        <DetailItem label="Username">{record.username}</DetailItem>
                        <DetailItem label="Email">{record.email}</DetailItem>
                        <DetailItem label="Status">
                            <Badge variant={record.status === 'active' ? 'default' : 'secondary'}>{record.status ?? '-'}</Badge>
                        </DetailItem>
                        <DetailItem label="Created At">{formatDateTime(record.created_at)}</DetailItem>
                        <DetailItem label="Updated At">{formatDateTime(record.updated_at)}</DetailItem>
                        <div className="space-y-2 md:col-span-2 xl:col-span-3">
                            <p className="text-xs text-muted-foreground">Roles:</p>
                            <div className="flex flex-wrap gap-2">
                                {(record.roles ?? []).length ? record.roles?.map((role) => <Badge key={role} variant="outline">{role}</Badge>) : <span className="text-sm italic text-muted-foreground">Not available</span>}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
