import { DataTableV1 } from '@/components/custom/data-table-v1';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/hooks/use-toast';
import http from '@/http/client';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@/lib/navigation';
import { formatDateTime } from '@/lib/date-format';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Pencil, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { crawlerItemConfig, type CrawlerItem, type CrawlerItemAudio } from '../shema';
import { crawlerItemAudioColumns } from './audio-columns';
import { buildCrawlerItemAudiosUrl, crawlerItemAudioFacetedFilters, normalizeCrawlerItemAudioIndexResponse } from '../overview/filters';
import { defaultCrawlerItemAudioSorting } from '../overview/sorting';

function DetailItem({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="space-y-1">
            <p className="text-xs text-muted-foreground">{label}:</p>
            <div className="text-sm font-medium">{children || <span className="italic text-muted-foreground">Not available</span>}</div>
        </div>
    );
}

function statusVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
    if (status === 'failed') return 'destructive';
    if (['ready', 'imported'].includes(status)) return 'default';
    if (['pending', 'processing', 'discovered'].includes(status)) return 'secondary';

    return 'outline';
}

export default function ShowCrawlerItem({ record }: { record: CrawlerItem }) {
    const navigate = useNavigate();
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const crawlMutation = useMutation({
        mutationFn: () => http.post(`/frieren-crawler/admin/items/${record.id}/crawl`),
        onSuccess: async () => {
            toast({ title: 'crawl item dispatched successfully', description: 'Crawler service is processing this item.' });
            await queryClient.invalidateQueries({ queryKey: ['crawler-items'] });
            await queryClient.invalidateQueries({ queryKey: ['crawler-item-audios', record.id] });
        },
        onError: () => {
            toast({ title: 'crawl item failed', description: 'Please check crawler service URL and endpoint.', variant: 'destructive' });
        },
    });

    return (
        <AppLayout breadcrumbs={[...crawlerItemConfig.breadcrumbs, { title: `ID: ${record.id}`, href: '#' }]}>
            <Head title={`Crawler Item #${record.id}`} />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-auto p-4 md:p-6">
                <div className="flex items-start justify-between gap-4">
                    <h1 className="text-2xl font-semibold">Crawler Item Details</h1>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" className="gap-2 shadow-sm" onClick={() => navigate(-1)}>
                            <ArrowLeft className="size-4" />
                            Back
                        </Button>
                        <Button className="gap-2 bg-blue-600 text-white shadow-sm hover:bg-blue-700" disabled={crawlMutation.isPending} onClick={() => crawlMutation.mutate()}>
                            <Play className="size-4" />
                            Crawl item
                        </Button>
                        <Button asChild className="gap-2 bg-green-600 text-white shadow-sm hover:bg-green-700 focus-visible:ring-green-500">
                            <Link href={`${crawlerItemConfig.basePath}/${record.id}/edit`}>
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
                        <DetailItem label="Title">{record.title}</DetailItem>
                        <DetailItem label="Status"><Badge variant={statusVariant(record.status)}>{record.status}</Badge></DetailItem>
                        <DetailItem label="Source">{record.source?.name}</DetailItem>
                        <DetailItem label="Podcast">{record.podcast?.title}</DetailItem>
                        <DetailItem label="Audios">{record.audio_count || record.audios_count || 0}</DetailItem>
                        <DetailItem label="Crawl Count">{record.crawl_count}</DetailItem>
                        <DetailItem label="Failure Count">{record.failure_count}</DetailItem>
                        <DetailItem label="Created At">{record.created_at ? formatDateTime(record.created_at) : null}</DetailItem>
                        <DetailItem label="Last Crawled">{record.last_crawled_at ? formatDateTime(record.last_crawled_at) : null}</DetailItem>
                        <DetailItem label="Source URL"><span className="break-all">{record.source_url}</span></DetailItem>
                        <DetailItem label="Canonical URL"><span className="break-all">{record.canonical_url}</span></DetailItem>
                        <div className="space-y-2 md:col-span-2 xl:col-span-3">
                            <p className="text-xs text-muted-foreground">Thumbnail:</p>
                            {record.thumbnail_url ? (
                                <img src={record.thumbnail_url} alt={record.title ?? 'Crawler item'} className="h-48 w-80 rounded-lg object-cover shadow-sm" />
                            ) : (
                                <p className="text-sm italic text-muted-foreground">Not available</p>
                            )}
                        </div>
                        <div className="space-y-1 md:col-span-2 xl:col-span-3">
                            <p className="text-xs text-muted-foreground">Description:</p>
                            <p className="whitespace-pre-wrap text-sm font-medium">{record.description || <span className="italic text-muted-foreground">Not available</span>}</p>
                        </div>
                        <div className="space-y-1 md:col-span-2 xl:col-span-3">
                            <p className="text-xs text-muted-foreground">Error:</p>
                            <p className="whitespace-pre-wrap text-sm font-medium text-red-600">{record.error_message || <span className="italic text-muted-foreground">Not available</span>}</p>
                        </div>
                    </div>
                </div>

                <div className="rounded-lg border bg-card p-6 shadow-sm">
                    <h2 className="mb-2 text-base font-semibold">Item Audios</h2>
                    <p className="mb-6 text-sm text-muted-foreground">Audio entries that belong to this crawler item.</p>
                    <DataTableV1<CrawlerItemAudio, unknown>
                        title={undefined}
                        columns={crawlerItemAudioColumns}
                        queryKey={['crawler-item-audios', record.id]}
                        initialSorting={defaultCrawlerItemAudioSorting}
                        searchPlaceholder="Search item audios"
                        facetedFilters={crawlerItemAudioFacetedFilters}
                        queryFn={async (request) => {
                            const response = await http.get(buildCrawlerItemAudiosUrl(record.id, request));

                            return normalizeCrawlerItemAudioIndexResponse(response.data);
                        }}
                    />
                </div>
            </div>
        </AppLayout>
    );
}
