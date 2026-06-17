import { Badge } from '@/components/ui/badge';
import { authorizeCheck } from '@/authorization';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import http from '@/http/client';
import { formatDateTime } from '@/lib/date-format';
import { Head, Link } from '@/lib/navigation';
import AppLayout from '@/layouts/app-layout';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { Bot, CheckCircle2, Eye, Play, RefreshCw, Server, Trash2, XCircle } from 'lucide-react';
import { useMemo, useState } from 'react';

type CrawlerOverview = {
    enabled: boolean;
    service: {
        base_url: string;
        health_path: string;
        dispatch_path: string;
    };
    rabbitmq: {
        host: string;
        port: number;
        management_url: string;
    };
    metrics: Record<string, number>;
};

type CrawlerSource = {
    id: number;
    name: string;
    type: string;
    url: string;
    status: string;
    selectors: Record<string, unknown> | null;
    options: Record<string, unknown> | null;
    last_crawled_at: string | null;
    created_at: string;
};

type CrawlerJob = {
    id: number;
    cursor?: { external_job_id?: string | null; response?: unknown } | null;
    target_url?: string;
    status: string;
    options?: unknown;
    error_message: string | null;
    started_at?: string | null;
    finished_at?: string | null;
    created_at: string;
    source?: Pick<CrawlerSource, 'id' | 'name' | 'type' | 'url'> | null;
    items?: Array<Pick<CrawlerItem, 'id' | 'title' | 'source_url' | 'status' | 'audio_count'>>;
};

type CrawlerItemAudio = {
    id: number;
    title: string | null;
    position: number | null;
    audio_url: string;
    http_status: number | null;
    content_type: string | null;
    content_length: number | null;
    duration_seconds: number | null;
    status: string;
    error_message: string | null;
    last_crawled_at: string | null;
    episode?: { id: number; title: string; slug: string | null } | null;
};

type CrawlerItem = {
    id: number;
    title: string | null;
    source_url: string;
    canonical_url: string | null;
    description: string | null;
    thumbnail_url: string | null;
    status: string;
    audio_count: number;
    audios_count?: number;
    crawl_count: number;
    failure_count: number;
    error_message: string | null;
    metadata: unknown;
    first_discovered_at: string | null;
    last_crawled_at: string | null;
    last_changed_at: string | null;
    imported_at: string | null;
    created_at: string;
    source?: Pick<CrawlerSource, 'id' | 'name' | 'type' | 'url'> | null;
    podcast?: { id: number; title: string; slug?: string | null } | null;
    audios?: CrawlerItemAudio[];
};

type AudioCandidate = {
    id: number;
    title: string | null;
    audio_url: string;
    status: string;
    http_status: number | null;
    content_type: string | null;
    content_length: number | null;
    imported_at: string | null;
    created_at: string;
    podcast?: { id: number; title: string } | null;
    episode?: { id: number; title: string } | null;
};

type EpisodeLinkCheck = {
    id: number;
    audio_url: string;
    status: string;
    http_status: number | null;
    error_message: string | null;
    checked_at?: string | null;
    last_crawled_at?: string | null;
    episode?: { id: number; title: string } | null;
};

type PodcastOption = {
    id: number;
    title: string;
};

type Paginated<T> = {
    data: T[];
    total: number;
    current_page: number;
    per_page: number;
};

type ErrorResponse = {
    data?: {
        error_message?: string | null;
    };
    message?: string;
};

const emptySource = {
    name: '',
    type: 'generic',
    url: '',
    status: 'active',
    selectors: '',
    options: '',
};

const crawlerRequestConfig = { timeout: 60000 };

function inferCrawlerType(url: string): string {
    try {
        const hostname = new URL(url).hostname;

        if (hostname === 'radiosach.com' || hostname.endsWith('.radiosach.com')) {
            return 'radiosach';
        }

        if (hostname === 'phatphapungdung.com' || hostname.endsWith('.phatphapungdung.com')) {
            return 'phatphapungdung';
        }
    } catch {
        return 'generic';
    }

    return 'generic';
}

function parseJsonField(value: string, fieldName: string) {
    if (!value.trim()) return null;

    try {
        return JSON.parse(value);
    } catch {
        throw new Error(`${fieldName} must be valid JSON.`);
    }
}

function statusVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
    if (status === 'failed') return 'destructive';
    if (['active', 'dispatched', 'completed'].includes(status)) return 'default';
    if (['queued', 'draft'].includes(status)) return 'secondary';

    return 'outline';
}

function JsonPreview({ value }: { value: unknown }) {
    return <pre className="max-h-[460px] overflow-auto rounded-md border bg-muted/40 p-3 text-xs">{JSON.stringify(value ?? null, null, 2)}</pre>;
}

export default function CrawlerDashboard() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('all');
    const [sourceDialogOpen, setSourceDialogOpen] = useState(false);
    const [sourceForm, setSourceForm] = useState(emptySource);
    const [dispatchUrl, setDispatchUrl] = useState('');
    const [dispatchSourceId, setDispatchSourceId] = useState('custom');
    const [podcastId, setPodcastId] = useState('');
    const [crawlSourceUrl, setCrawlSourceUrl] = useState('');
    const [rawAudioUrls, setRawAudioUrls] = useState('');
    const [titlePrefix, setTitlePrefix] = useState('');
    const [selectedJson, setSelectedJson] = useState<unknown>(null);
    const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
    const [bulkItemSourceId, setBulkItemSourceId] = useState('');
    const [bulkItemCount, setBulkItemCount] = useState('5');
    const [bulkItemSelection, setBulkItemSelection] = useState('pending');
    const canUpdateCrawler = authorizeCheck('UPDATE_CRAWLER');

    const overview = useQuery({
        queryKey: ['crawlers', 'overview'],
        queryFn: async () => {
            const response = await http.get<{ data: CrawlerOverview }>('/frieren-crawler/admin/overview');

            return response.data.data;
        },
    });

    const sources = useQuery({
        queryKey: ['crawlers', 'sources', search, status],
        queryFn: async () => {
            const response = await http.get<Paginated<CrawlerSource>>('/frieren-crawler/admin/sources', {
                params: {
                    per_page: 20,
                    search: search || undefined,
                    status: status === 'all' ? undefined : status,
                },
            });

            return response.data;
        },
    });

    const jobs = useQuery({
        queryKey: ['crawlers', 'jobs', search],
        queryFn: async () => {
            const response = await http.get<Paginated<CrawlerJob>>('/frieren-crawler/admin/jobs', {
                params: {
                    per_page: 20,
                    search: search || undefined,
                },
            });

            return response.data;
        },
    });

    const items = useQuery({
        queryKey: ['crawlers', 'items', search, status],
        queryFn: async () => {
            const response = await http.get<Paginated<CrawlerItem>>('/frieren-crawler/admin/items', {
                params: {
                    search: search || undefined,
                    status: status === 'all' ? undefined : status,
                    per_page: 10,
                },
            });

            return response.data;
        },
    });

    const selectedItem = useQuery({
        queryKey: ['crawlers', 'items', selectedItemId],
        enabled: selectedItemId !== null,
        queryFn: async () => {
            const response = await http.get<{ data: CrawlerItem }>(`/frieren-crawler/admin/items/${selectedItemId}`);

            return response.data.data;
        },
    });

    const sourceOptions = sources.data?.data ?? [];
    const selectedSource = useMemo(() => sourceOptions.find((source) => String(source.id) === dispatchSourceId), [dispatchSourceId, sourceOptions]);

    const podcasts = useQuery({
        queryKey: ['crawlers', 'podcasts', 'options'],
        queryFn: async () => {
            const response = await http.get<{ data: PodcastOption[] }>('/podcasts', { params: { per_page: 200 } });

            return response.data.data;
        },
    });

    const audioCandidates = useQuery({
        queryKey: ['crawlers', 'audio-candidates', podcastId],
        queryFn: async () => {
            const response = await http.get<Paginated<AudioCandidate>>('/frieren-crawler/admin/audio-candidates', {
                params: {
                    per_page: 20,
                    podcast_id: podcastId || undefined,
                },
            });

            return response.data;
        },
    });

    const linkChecks = useQuery({
        queryKey: ['crawlers', 'link-checks', podcastId],
        queryFn: async () => {
            const response = await http.get<Paginated<EpisodeLinkCheck>>('/frieren-crawler/admin/link-checks', {
                params: {
                    per_page: 20,
                    podcast_id: podcastId || undefined,
                },
            });

            return response.data;
        },
    });

    const invalidateCrawler = async () => {
        await queryClient.invalidateQueries({ queryKey: ['crawlers'] });
    };

    const healthCheck = useMutation({
        mutationFn: () => http.get('/frieren-crawler/admin/health'),
        onSuccess: (response) => {
            toast({
                title: response.data.data?.ok ? 'crawler service is healthy' : 'crawler service responded',
                description: `Status: ${response.data.data?.status ?? 'unknown'}`,
            });
        },
        onError: () => {
            toast({
                title: 'crawler service health failed',
                description: 'Please check frieren-crawler and service URL.',
                variant: 'destructive',
            });
        },
    });

    const createSource = useMutation({
        mutationFn: () => {
            const payload = {
                name: sourceForm.name,
                type: sourceForm.type,
                url: sourceForm.url,
                status: sourceForm.status,
                selectors: parseJsonField(sourceForm.selectors, 'Selectors'),
                options: parseJsonField(sourceForm.options, 'Options'),
            };

            return http.post('/frieren-crawler/admin/sources', payload);
        },
        onSuccess: async () => {
            toast({ title: 'create crawler source successfully', description: 'Crawler source is ready to dispatch.' });
            setSourceDialogOpen(false);
            setSourceForm(emptySource);
            await invalidateCrawler();
        },
        onError: (error) => {
            const message = error instanceof Error ? error.message : 'Something went wrong.';
            toast({ title: 'create crawler source failed', description: message, variant: 'destructive' });
        },
    });

    const deleteSource = useMutation({
        mutationFn: (source: CrawlerSource) => http.delete(`/frieren-crawler/admin/sources/${source.id}`),
        onSuccess: async () => {
            toast({ title: 'delete crawler source successfully', description: 'Crawler source was removed.' });
            await invalidateCrawler();
        },
        onError: () => toast({ title: 'delete crawler source failed', description: 'Something went wrong.', variant: 'destructive' }),
    });

    const dispatchJob = useMutation({
        mutationFn: () => {
            const crawlerType = dispatchSourceId === 'custom' ? inferCrawlerType(dispatchUrl) : (selectedSource?.type ?? 'generic');

            return http.post(
                '/frieren-crawler/admin/jobs/dispatch',
                {
                    source_id: dispatchSourceId === 'custom' ? undefined : Number(dispatchSourceId),
                    target_url: dispatchSourceId === 'custom' ? dispatchUrl : undefined,
                    type: crawlerType,
                    connector: crawlerType,
                },
                crawlerRequestConfig,
            );
        },
        onSuccess: async () => {
            toast({ title: 'dispatch crawler job successfully', description: 'Crawler job was sent to the crawler service.' });
            setDispatchUrl('');
            await invalidateCrawler();
        },
        onError: (error: AxiosError<ErrorResponse>) => {
            const message = error.response?.data?.data?.error_message ?? error.response?.data?.message ?? 'Please check crawler service URL and endpoint.';
            toast({ title: 'dispatch crawler job failed', description: message, variant: 'destructive' });
        },
    });

    const crawlSelectedItems = useMutation({
        mutationFn: () =>
            http.post('/frieren-crawler/admin/items/crawl', {
                source_id: Number(bulkItemSourceId),
                count: Number(bulkItemCount),
                selection: bulkItemSelection,
            }),
        onSuccess: async (response) => {
            toast({
                title: 'crawl items dispatched successfully',
                description: `${response.data.data?.dispatched_count ?? 0} item(s) were sent to crawler service.`,
            });
            await invalidateCrawler();
        },
        onError: (error: AxiosError<ErrorResponse>) => {
            const message = error.response?.data?.message ?? 'Please select a source and valid item count.';
            toast({ title: 'crawl items failed', description: message, variant: 'destructive' });
        },
    });

    const crawlSingleItem = useMutation({
        mutationFn: (itemId: number) => http.post(`/frieren-crawler/admin/items/${itemId}/crawl`),
        onSuccess: async () => {
            toast({ title: 'crawl item dispatched successfully', description: 'Crawler service is processing this item.' });
            await invalidateCrawler();
        },
        onError: (error: AxiosError<ErrorResponse>) => {
            const message = error.response?.data?.message ?? 'Please check crawler service URL and endpoint.';
            toast({ title: 'crawl item failed', description: message, variant: 'destructive' });
        },
    });

    const collectPodcastAudio = useMutation({
        mutationFn: () =>
            http.post(
                '/frieren-crawler/admin/podcast-audio/collect',
                {
                    podcast_id: Number(podcastId),
                    source_url: crawlSourceUrl || undefined,
                    raw_urls: rawAudioUrls || undefined,
                    title_prefix: titlePrefix || undefined,
                    validate: true,
                },
                crawlerRequestConfig,
            ),
        onSuccess: async (response) => {
            toast({
                title: 'crawl podcast audio successfully',
                description: `${response.data.data?.valid_candidates ?? 0} valid audio URL(s) from ${response.data.data?.stored_candidates ?? 0} candidate(s).`,
            });
            await invalidateCrawler();
        },
        onError: () => toast({ title: 'crawl podcast audio failed', description: 'Please check source URL or raw audio URLs.', variant: 'destructive' }),
    });

    const importPodcastAudio = useMutation({
        mutationFn: () =>
            http.post('/frieren-crawler/admin/podcast-audio/import', {
                podcast_id: Number(podcastId),
                import_all_valid: true,
            }),
        onSuccess: async (response) => {
            toast({
                title: 'import episodes successfully',
                description: `${response.data.data?.imported_episodes ?? 0} episode(s) imported.`,
            });
            await invalidateCrawler();
        },
        onError: () => toast({ title: 'import episodes failed', description: 'Only valid and not imported candidates can be imported.', variant: 'destructive' }),
    });

    const checkPodcastLinks = useMutation({
        mutationFn: () => http.post(`/frieren-crawler/admin/podcasts/${podcastId}/link-checks/run`, undefined, crawlerRequestConfig),
        onSuccess: async (response) => {
            toast({
                title: 'check podcast links successfully',
                description: `${response.data.data?.invalid ?? 0} broken link(s) from ${response.data.data?.checked ?? 0} episode(s).`,
            });
            await invalidateCrawler();
        },
        onError: () => toast({ title: 'check podcast links failed', description: 'Please select a podcast and try again.', variant: 'destructive' }),
    });

    return (
        <AppLayout breadcrumbs={[{ title: 'Crawler management', href: '/portal/crawlers' }]}>
            <Head title="Crawler management" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-auto p-4 md:p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-semibold">Crawler management</h1>
                        <p className="text-sm text-muted-foreground">Manage crawl sources, dispatch crawler jobs, and check the crawler service.</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button variant="outline" className="gap-2" disabled={healthCheck.isPending} onClick={() => healthCheck.mutate()}>
                            <RefreshCw className={healthCheck.isPending ? 'size-4 animate-spin' : 'size-4'} />
                            Health check
                        </Button>
                        <Button asChild variant="outline" className="gap-2">
                            <Link href="/portal/crawler-items">
                                <Eye className="size-4" />
                                Open items table
                            </Link>
                        </Button>
                        <Button className="gap-2 bg-blue-600 text-white hover:bg-blue-700" disabled={!canUpdateCrawler} onClick={() => setSourceDialogOpen(true)}>
                            <Bot className="size-4" />
                            Add source
                        </Button>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <Card className="rounded-lg">
                        <CardHeader className="pb-2">
                            <CardDescription>Module</CardDescription>
                            <CardTitle className="flex items-center gap-2 text-base">
                                {overview.data?.enabled ? <CheckCircle2 className="size-4 text-green-600" /> : <XCircle className="size-4 text-red-600" />}
                                {overview.data?.enabled ? 'Enabled' : 'Disabled'}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm text-muted-foreground">{overview.data?.service.base_url ?? 'http://127.0.0.1:3101'}</CardContent>
                    </Card>
                    <Card className="rounded-lg">
                        <CardHeader className="pb-2">
                            <CardDescription>Active sources</CardDescription>
                            <CardTitle>{overview.data?.metrics.active_sources ?? 0}</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm text-muted-foreground">{overview.data?.metrics.sources ?? 0} total sources</CardContent>
                    </Card>
                    <Card className="rounded-lg">
                        <CardHeader className="pb-2">
                            <CardDescription>Queued jobs</CardDescription>
                            <CardTitle>{overview.data?.metrics.queued_jobs ?? 0}</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm text-muted-foreground">{overview.data?.metrics.jobs ?? 0} total jobs</CardContent>
                    </Card>
                    <Card className="rounded-lg">
                        <CardHeader className="pb-2">
                            <CardDescription>RabbitMQ</CardDescription>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Server className="size-4 text-blue-600" />
                                {overview.data?.rabbitmq.host ?? '127.0.0.1'}:{overview.data?.rabbitmq.port ?? 5672}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm text-muted-foreground">{overview.data?.rabbitmq.management_url ?? 'http://127.0.0.1:15672'}</CardContent>
                    </Card>
                </div>

                <Card className="rounded-lg">
                    <CardHeader>
                        <CardTitle className="text-base">Dispatch crawl job</CardTitle>
                        <CardDescription>Select a saved source or send a custom URL to the crawler service.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-3 lg:grid-cols-[260px_1fr_auto]">
                        <Select value={dispatchSourceId} onValueChange={setDispatchSourceId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select source" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="custom">Custom URL</SelectItem>
                                {sourceOptions.map((source) => (
                                    <SelectItem key={source.id} value={String(source.id)}>
                                        {source.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Input
                            value={dispatchSourceId === 'custom' ? dispatchUrl : selectedSource?.url ?? ''}
                            onChange={(event) => setDispatchUrl(event.target.value)}
                            disabled={dispatchSourceId !== 'custom'}
                            placeholder="https://example.com/source"
                        />
                        <Button className="gap-2 bg-blue-600 text-white hover:bg-blue-700" disabled={!canUpdateCrawler || dispatchJob.isPending} onClick={() => dispatchJob.mutate()}>
                            <Play className="size-4" />
                            Dispatch
                        </Button>
                    </CardContent>
                </Card>

                <Card className="rounded-lg">
                    <CardHeader>
                        <CardTitle className="text-base">Podcast audio crawl pipeline</CardTitle>
                        <CardDescription>Crawl audio URLs, validate them, review candidates, then import valid URLs as episodes.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-3 lg:grid-cols-[280px_1fr_220px]">
                            <Select value={podcastId} onValueChange={setPodcastId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select podcast" />
                                </SelectTrigger>
                                <SelectContent>
                                    {(podcasts.data ?? []).map((podcast) => (
                                        <SelectItem key={podcast.id} value={String(podcast.id)}>
                                            {podcast.title}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Input value={crawlSourceUrl} onChange={(event) => setCrawlSourceUrl(event.target.value)} placeholder="Source page URL to crawl audio links" />
                            <Input value={titlePrefix} onChange={(event) => setTitlePrefix(event.target.value)} placeholder="Title prefix" />
                        </div>
                        <Textarea
                            className="min-h-28"
                            value={rawAudioUrls}
                            onChange={(event) => setRawAudioUrls(event.target.value)}
                            placeholder="Optional: paste one audio URL per line. The crawler will merge these with links found in the source page."
                        />
                        <div className="flex flex-wrap gap-2">
                            <Button
                                className="gap-2 bg-blue-600 text-white hover:bg-blue-700"
                                disabled={!canUpdateCrawler || !podcastId || collectPodcastAudio.isPending}
                                onClick={() => collectPodcastAudio.mutate()}
                            >
                                <Bot className="size-4" />
                                Crawl and validate
                            </Button>
                            <Button
                                variant="outline"
                                disabled={!canUpdateCrawler || !podcastId || importPodcastAudio.isPending}
                                onClick={() => importPodcastAudio.mutate()}
                            >
                                Import valid candidates
                            </Button>
                            <Button
                                variant="outline"
                                disabled={!canUpdateCrawler || !podcastId || checkPodcastLinks.isPending}
                                onClick={() => checkPodcastLinks.mutate()}
                            >
                                Check existing episode links
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex flex-wrap gap-3">
                    <Input className="max-w-sm" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search source or job" />
                    <Select value={status} onValueChange={setStatus}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All status</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="paused">Paused</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <Card className="rounded-lg">
                    <CardHeader>
                        <CardTitle className="text-base">Crawler items</CardTitle>
                        <CardDescription>Manage discovered podcast pages and crawl selected items into item audio records.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-3 lg:grid-cols-[280px_160px_180px_auto]">
                            <Select value={bulkItemSourceId} onValueChange={setBulkItemSourceId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select source" />
                                </SelectTrigger>
                                <SelectContent>
                                    {sourceOptions.map((source) => (
                                        <SelectItem key={source.id} value={String(source.id)}>
                                            {source.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Input value={bulkItemCount} onChange={(event) => setBulkItemCount(event.target.value)} type="number" min={1} max={100} placeholder="Item count" />
                            <Select value={bulkItemSelection} onValueChange={setBulkItemSelection}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="failed">Failed</SelectItem>
                                    <SelectItem value="oldest">Oldest</SelectItem>
                                    <SelectItem value="all">All</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button
                                className="gap-2 bg-blue-600 text-white hover:bg-blue-700"
                                disabled={!canUpdateCrawler || !bulkItemSourceId || crawlSelectedItems.isPending}
                                onClick={() => crawlSelectedItems.mutate()}
                            >
                                <Bot className="size-4" />
                                Crawl selected items
                            </Button>
                        </div>

                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Source</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Audios</TableHead>
                                    <TableHead>Last crawled</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {(items.data?.data ?? []).map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell className="max-w-[280px]">
                                            <div className="truncate font-medium">{item.title ?? 'Untitled item'}</div>
                                            <div className="truncate text-xs text-muted-foreground">{item.source_url}</div>
                                        </TableCell>
                                        <TableCell>{item.source?.name ?? '-'}</TableCell>
                                        <TableCell>
                                            <Badge variant={statusVariant(item.status)}>{item.status}</Badge>
                                        </TableCell>
                                        <TableCell>{item.audio_count || item.audios_count || 0}</TableCell>
                                        <TableCell>{item.last_crawled_at ? formatDateTime(item.last_crawled_at) : '-'}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-1">
                                                <Button variant="ghost" size="icon" onClick={() => setSelectedItemId(item.id)}>
                                                    <Eye className="size-4 text-blue-600" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    disabled={!canUpdateCrawler || crawlSingleItem.isPending}
                                                    onClick={() => crawlSingleItem.mutate(item.id)}
                                                >
                                                    <Play className="size-4 text-green-600" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                <Card className="rounded-lg">
                    <CardHeader>
                        <CardTitle className="text-base">Crawler sources</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>URL</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Created</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {(sources.data?.data ?? []).map((source) => (
                                    <TableRow key={source.id}>
                                        <TableCell className="font-medium">{source.name}</TableCell>
                                        <TableCell>{source.type}</TableCell>
                                        <TableCell className="max-w-[420px] truncate">{source.url}</TableCell>
                                        <TableCell>
                                            <Badge variant={statusVariant(source.status)}>{source.status}</Badge>
                                        </TableCell>
                                        <TableCell>{formatDateTime(source.created_at)}</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon" disabled={!canUpdateCrawler} onClick={() => deleteSource.mutate(source)}>
                                                <Trash2 className="size-4 text-red-600" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                <div className="grid gap-6 xl:grid-cols-2">
                    <Card className="rounded-lg">
                        <CardHeader>
                            <CardTitle className="text-base">Audio candidates</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Title</TableHead>
                                        <TableHead>URL</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Imported</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {(audioCandidates.data?.data ?? []).map((candidate) => (
                                        <TableRow key={candidate.id}>
                                            <TableCell className="font-medium">{candidate.title ?? '-'}</TableCell>
                                            <TableCell className="max-w-[320px] truncate">{candidate.audio_url}</TableCell>
                                            <TableCell>
                                                <Badge variant={statusVariant(candidate.status)}>{candidate.status}</Badge>
                                            </TableCell>
                                            <TableCell>{candidate.imported_at ? formatDateTime(candidate.imported_at) : '-'}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    <Card className="rounded-lg">
                        <CardHeader>
                            <CardTitle className="text-base">Episode link checks</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Episode</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>HTTP</TableHead>
                                        <TableHead>Checked</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {(linkChecks.data?.data ?? []).map((check) => (
                                        <TableRow key={check.id}>
                                            <TableCell className="max-w-[260px] truncate">{check.episode?.title ?? check.audio_url}</TableCell>
                                            <TableCell>
                                                <Badge variant={statusVariant(check.status)}>{check.status}</Badge>
                                            </TableCell>
                                            <TableCell>{check.http_status ?? '-'}</TableCell>
                                            <TableCell>{check.checked_at || check.last_crawled_at ? formatDateTime(check.checked_at ?? check.last_crawled_at ?? '') : '-'}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>

                <Card className="rounded-lg">
                    <CardHeader>
                        <CardTitle className="text-base">Crawler jobs</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>ID</TableHead>
                                    <TableHead>Source</TableHead>
                                    <TableHead>Target</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Dispatched</TableHead>
                                    <TableHead className="text-right">Payload</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {(jobs.data?.data ?? []).map((job) => (
                                    <TableRow key={job.id}>
                                        <TableCell>{job.cursor?.external_job_id ?? job.id}</TableCell>
                                        <TableCell>{job.source?.name ?? 'Custom'}</TableCell>
                                        <TableCell className="max-w-[420px] truncate">{job.items?.[0]?.source_url ?? '-'}</TableCell>
                                        <TableCell>
                                            <Badge variant={statusVariant(job.status)}>{job.status}</Badge>
                                        </TableCell>
                                        <TableCell>{job.started_at ? formatDateTime(job.started_at) : '-'}</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="outline" size="sm" onClick={() => setSelectedJson(job)}>
                                                View
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                <Dialog open={sourceDialogOpen} onOpenChange={setSourceDialogOpen} >
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-auto">
                        <DialogHeader>
                            <DialogTitle>Create crawler source</DialogTitle>
                            <DialogDescription>Save a reusable source for crawler jobs.</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-2">
                            <div className="grid gap-2">
                                <Label>Name <span className="text-red-500">*</span></Label>
                                <Input value={sourceForm.name} onChange={(event) => setSourceForm((form) => ({ ...form, name: event.target.value }))} />
                            </div>
                            <div className="grid gap-3 md:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label>Type <span className="text-red-500">*</span></Label>
                                    <Select value={sourceForm.type} onValueChange={(value) => setSourceForm((form) => ({ ...form, type: value }))}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="generic">Generic</SelectItem>
                                            <SelectItem value="radiosach">Radiosach</SelectItem>
                                            <SelectItem value="phatphapungdung">Phat Phap Ung Dung</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <Label>Status <span className="text-red-500">*</span></Label>
                                    <Select value={sourceForm.status} onValueChange={(value) => setSourceForm((form) => ({ ...form, status: value }))}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="active">Active</SelectItem>
                                            <SelectItem value="paused">Paused</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label>URL <span className="text-red-500">*</span></Label>
                                <Input value={sourceForm.url} onChange={(event) => setSourceForm((form) => ({ ...form, url: event.target.value }))} />
                            </div>
                            <div className="grid gap-3 md:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label>Selectors JSON</Label>
                                    <Textarea className="min-h-28" value={sourceForm.selectors} onChange={(event) => setSourceForm((form) => ({ ...form, selectors: event.target.value }))} placeholder='{"title": "h1"}' />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Options JSON</Label>
                                    <Textarea className="min-h-28" value={sourceForm.options} onChange={(event) => setSourceForm((form) => ({ ...form, options: event.target.value }))} placeholder='{"depth": 1}' />
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setSourceDialogOpen(false)}>Cancel</Button>
                            <Button className="bg-blue-600 text-white hover:bg-blue-700" disabled={createSource.isPending} onClick={() => createSource.mutate()}>
                                Save
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <Dialog open={selectedItemId !== null} onOpenChange={(open) => !open && setSelectedItemId(null)}>
                    <DialogContent className="max-h-[90vh] max-w-5xl overflow-auto">
                        <DialogHeader>
                            <DialogTitle>Crawler item detail</DialogTitle>
                            <DialogDescription>Review item information, crawl status, metadata, and item audio records.</DialogDescription>
                        </DialogHeader>
                        {selectedItem.data ? (
                            <div className="space-y-5">
                                <div className="grid gap-4 md:grid-cols-[180px_1fr_auto]">
                                    <div className="overflow-hidden rounded-md border bg-muted/20">
                                        {selectedItem.data.thumbnail_url ? (
                                            <img src={selectedItem.data.thumbnail_url} alt={selectedItem.data.title ?? 'Crawler item'} className="aspect-[4/3] h-full w-full object-cover" />
                                        ) : (
                                            <div className="flex aspect-[4/3] items-center justify-center text-sm text-muted-foreground">No image</div>
                                        )}
                                    </div>
                                    <div className="min-w-0 space-y-2">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <h3 className="truncate text-lg font-semibold">{selectedItem.data.title ?? 'Untitled item'}</h3>
                                            <Badge variant={statusVariant(selectedItem.data.status)}>{selectedItem.data.status}</Badge>
                                        </div>
                                        <p className="line-clamp-3 text-sm text-muted-foreground">{selectedItem.data.description ?? 'No description'}</p>
                                        <div className="grid gap-1 text-sm">
                                            <span className="truncate"><span className="text-muted-foreground">Source:</span> {selectedItem.data.source_url}</span>
                                            <span><span className="text-muted-foreground">Source name:</span> {selectedItem.data.source?.name ?? '-'}</span>
                                            <span><span className="text-muted-foreground">Audios:</span> {selectedItem.data.audio_count || selectedItem.data.audios?.length || 0}</span>
                                            <span><span className="text-muted-foreground">Last crawled:</span> {selectedItem.data.last_crawled_at ? formatDateTime(selectedItem.data.last_crawled_at) : '-'}</span>
                                            {selectedItem.data.error_message ? <span className="text-red-600">{selectedItem.data.error_message}</span> : null}
                                        </div>
                                    </div>
                                    <Button
                                        className="gap-2 bg-blue-600 text-white hover:bg-blue-700"
                                        disabled={!canUpdateCrawler || crawlSingleItem.isPending}
                                        onClick={() => selectedItem.data && crawlSingleItem.mutate(selectedItem.data.id)}
                                    >
                                        <Play className="size-4" />
                                        Crawl item
                                    </Button>
                                </div>

                                <div className="rounded-md border">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="w-16">#</TableHead>
                                                <TableHead>Title</TableHead>
                                                <TableHead>Audio URL</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Duration</TableHead>
                                                <TableHead>HTTP</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {(selectedItem.data.audios ?? []).map((audio) => (
                                                <TableRow key={audio.id}>
                                                    <TableCell>{audio.position ?? '-'}</TableCell>
                                                    <TableCell className="max-w-[220px] truncate">{audio.title ?? '-'}</TableCell>
                                                    <TableCell className="max-w-[420px] truncate">{audio.audio_url}</TableCell>
                                                    <TableCell>
                                                        <Badge variant={statusVariant(audio.status)}>{audio.status}</Badge>
                                                    </TableCell>
                                                    <TableCell>{audio.duration_seconds ? `${Math.round(audio.duration_seconds / 60)} min` : '-'}</TableCell>
                                                    <TableCell>{audio.http_status ?? '-'}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>

                                <JsonPreview value={selectedItem.data.metadata} />
                            </div>
                        ) : (
                            <div className="py-8 text-center text-sm text-muted-foreground">Loading item detail...</div>
                        )}
                    </DialogContent>
                </Dialog>

                <Dialog open={selectedJson !== null} onOpenChange={(open) => !open && setSelectedJson(null)}>
                    <DialogContent className="max-w-3xl">
                        <DialogHeader>
                            <DialogTitle>Crawler job detail</DialogTitle>
                            <DialogDescription>Payload, service response, and error information.</DialogDescription>
                        </DialogHeader>
                        <JsonPreview value={selectedJson} />
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
