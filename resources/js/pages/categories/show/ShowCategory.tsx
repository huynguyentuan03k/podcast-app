import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/hooks/use-toast';
import http from '@/http/client';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@/lib/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { categoryConfig, type Category } from '../shema';

function DetailItem({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="space-y-1">
            <p className="text-xs text-muted-foreground">{label}:</p>
            <div className="text-sm font-medium">{children || <span className="italic text-muted-foreground">Not available</span>}</div>
        </div>
    );
}

function formatDate(value: Category['created_at']) {
    if (!value) return null;

    return new Intl.DateTimeFormat('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(value));
}

export default function ShowCategory({ record }: { record: Category }) {
    const navigate = useNavigate();
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const deleteMutation = useMutation({
        mutationFn: () => http.delete(`${categoryConfig.endpoint.replace('/api/', '/')}/${record.id}`),
        onSuccess: async () => {
            toast({ title: 'delete category successfully', description: 'category has been deleted.' });
            await queryClient.invalidateQueries({ queryKey: ['categories'] });
            navigate(categoryConfig.basePath);
        },
        onError: () => {
            toast({ title: 'delete category failed', description: 'Something went wrong', variant: 'destructive' });
        },
    });

    return (
        <AppLayout breadcrumbs={[...categoryConfig.breadcrumbs, { title: `ID: ${record.id}`, href: '#' }]}>
            <Head title={`Category #${record.id}`} />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-auto p-4 md:p-6">
                <div className="flex items-start justify-between gap-4">
                    <h1 className="text-2xl font-semibold">Category Details</h1>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" className="gap-2 shadow-sm" onClick={() => navigate(-1)}>
                            <ArrowLeft className="size-4" />
                            Back
                        </Button>
                        <Button
                            variant="destructive"
                            className="gap-2 shadow-sm"
                            disabled={deleteMutation.isPending}
                            onClick={() => {
                                if (confirm(`Delete category #${record.id}?`)) deleteMutation.mutate();
                            }}
                        >
                            <Trash2 className="size-4" />
                            Delete
                        </Button>
                        <Button asChild className="gap-2 bg-blue-600 text-white shadow-sm hover:bg-blue-700 focus-visible:ring-blue-500">
                            <Link href={`${categoryConfig.basePath}/${record.id}/edit`}>
                                <Pencil className="size-4" />
                                Edit
                            </Link>
                        </Button>
                    </div>
                </div>

                <div className="rounded-lg border bg-card p-6 shadow-sm">
                    <h2 className="mb-8 text-base font-semibold">General Information</h2>
                    <div className="grid gap-x-12 gap-y-8 md:grid-cols-2 xl:grid-cols-3">
                        <DetailItem label="ID">{record.id}</DetailItem>
                        <DetailItem label="Name EN">{record.name.en}</DetailItem>
                        <DetailItem label="Name VI">{record.name.vi}</DetailItem>
                        <DetailItem label="Created At">{formatDate(record.created_at)}</DetailItem>
                        <DetailItem label="Updated At">{formatDate(record.updated_at)}</DetailItem>
                        <div className="space-y-1 md:col-span-2 xl:col-span-3">
                            <p className="text-xs text-muted-foreground">Description:</p>
                            <p className="whitespace-pre-wrap text-sm font-medium">{record.description || <span className="italic text-muted-foreground">Not available</span>}</p>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
