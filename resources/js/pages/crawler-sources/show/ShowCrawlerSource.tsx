import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/hooks/use-toast';
import http from '@/http/client';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@/lib/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CrawlerItemsTable from '@/pages/crawler-items/overview/CrawlerItemsTable';
import { crawlerSourceConfig, type CrawlerSource } from '../shema';

function DetailItem({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="space-y-1">
            <p className="text-xs text-muted-foreground">{label}:</p>
            <div className="text-sm font-medium">{children || <span className="italic text-muted-foreground">Not available</span>}</div>
        </div>
    );
}

function formatDate(value: CrawlerSource['created_at']) {
    if (!value) return null;

    return new Intl.DateTimeFormat('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(value));
}

export default function ShowCrawlerSource({ record }: { record: CrawlerSource }) {
    const navigate = useNavigate();
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const deleteMutation = useMutation({
        mutationFn: () => http.delete(`${crawlerSourceConfig.endpoint.replace('/api/', '/')}/${record.id}`),
        onSuccess: async () => {
            toast({ title: 'delete crawler source successfully', description: 'crawler source has been deleted.' });
            await queryClient.invalidateQueries({ queryKey: ['crawler-sources'] });
            navigate(crawlerSourceConfig.basePath);
        },
        onError: () => {
            toast({ title: 'delete crawler source failed', description: 'Something went wrong', variant: 'destructive' });
        },
    });

    return (
        <AppLayout breadcrumbs={[...crawlerSourceConfig.breadcrumbs, { title: `ID: ${record.id}`, href: '#' }]}>
            <Head title={`Crawler Source #${record.id}`} />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-auto p-4 md:p-6">
                <div className="flex items-start justify-between gap-4">
                    <h1 className="text-2xl font-semibold">Crawler Source Details</h1>
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
                                if (confirm(`Delete crawler source #${record.id}?`)) deleteMutation.mutate();
                            }}
                        >
                            <Trash2 className="size-4" />
                            Delete
                        </Button>
                        <Button asChild className="gap-2 bg-blue-600 text-white shadow-sm hover:bg-blue-700 focus-visible:ring-blue-500">
                            <Link href={`${crawlerSourceConfig.basePath}/${record.id}/edit`}>
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
                        <DetailItem label="Name">{record.name}</DetailItem>
                        <DetailItem label="Type">
                            <Badge variant="secondary">{record.type ?? '-'}</Badge>
                        </DetailItem>
                        <DetailItem label="Status">
                            <Badge variant={record.status === 'active' ? 'default' : 'outline'}>{record.status ?? '-'}</Badge>
                        </DetailItem>
                        <DetailItem label="Profile">{record.profile?.name ?? '-'}</DetailItem>
                        <DetailItem label="Host">{record.host}</DetailItem>
                        <DetailItem label="Base URL">
                            {record.base_url ? (
                                <a className="text-blue-600 hover:underline" href={record.base_url} target="_blank" rel="noreferrer">
                                    {record.base_url}
                                </a>
                            ) : null}
                        </DetailItem>
                        <DetailItem label="Last Crawled At">{formatDate(record.last_crawled_at)}</DetailItem>
                        <DetailItem label="Created At">{formatDate(record.created_at)}</DetailItem>
                        <DetailItem label="Updated At">{formatDate(record.updated_at)}</DetailItem>
                        <div className="space-y-1 md:col-span-2 xl:col-span-3">
                            <p className="text-xs text-muted-foreground">Start URLs:</p>
                            <p className="whitespace-pre-wrap text-sm font-medium">
                                {record.start_urls?.length ? record.start_urls.join('\n') : <span className="italic text-muted-foreground">Not available</span>}
                            </p>
                        </div>
                        <div className="space-y-1 md:col-span-2 xl:col-span-3">
                            <p className="text-xs text-muted-foreground">Options Override:</p>
                            <pre className="overflow-auto rounded-md bg-muted/40 p-3 text-sm">
                                {record.options_override ? JSON.stringify(record.options_override, null, 2) : 'Not available'}
                            </pre>
                        </div>
                    </div>
                </div>

                <div className="rounded-lg border bg-card p-6 shadow-sm">
                    <h2 className="mb-2 text-base font-semibold">Crawler Items</h2>
                    <p className="mb-6 text-sm text-muted-foreground">Items that belong to this crawler source. You can create, crawl, edit, and delete them here.</p>
                    <CrawlerItemsTable title={undefined} sourceId={record.id} createHref={`/portal/crawler-items/create?source_id=${record.id}`} />
                </div>
            </div>
        </AppLayout>
    );
}
