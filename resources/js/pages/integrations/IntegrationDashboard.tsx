import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import http from '@/http/client';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@/lib/navigation';
import { formatDateTime } from '@/lib/date-format';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, CheckCircle2, Eye, Play, RefreshCw, RotateCcw, ServerCog, XCircle } from 'lucide-react';
import { useMemo, useState } from 'react';

type IntegrationOverview = {
    enabled: boolean;
    api_prefix: string;
    rabbitmq: {
        host: string;
        port: number;
        vhost: string;
        exchange: string;
        queue: string;
    };
    metrics: Record<string, number>;
};

type ImportBatch = {
    id: number;
    external_job_id: string;
    source_url: string | null;
    entity_type: string;
    status: string;
    normalized_data: unknown;
    validation_result: unknown;
    rejection_reason: string | null;
    created_at: string;
    updated_at: string;
};

type IntegrationInbox = {
    id: number;
    event_id: string;
    event_type: string;
    producer: string;
    payload: unknown;
    status: string;
    received_at: string;
    processed_at: string | null;
    error_message: string | null;
    created_at: string;
};

type IntegrationOutbox = {
    id: number;
    event_id: string;
    event_type: string;
    routing_key: string;
    payload: unknown;
    status: string;
    attempts: number;
    available_at: string;
    published_at: string | null;
    last_error: string | null;
    created_at: string;
};

type Paginated<T> = {
    data: T[];
    total: number;
    current_page: number;
    per_page: number;
};

type TabKey = 'batches' | 'outbox' | 'inbox';

const tabs: Array<{ key: TabKey; label: string }> = [
    { key: 'batches', label: 'Import batches' },
    { key: 'outbox', label: 'Outbox' },
    { key: 'inbox', label: 'Inbox' },
];

const importStatuses = ['received', 'validating', 'waiting_review', 'approved', 'rejected', 'importing', 'imported', 'failed'];
const outboxStatuses = ['pending', 'published', 'failed'];
const inboxStatuses = ['received', 'processed', 'failed'];

function statusVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
    if (['failed', 'rejected'].includes(status)) return 'destructive';
    if (['published', 'processed', 'approved', 'imported'].includes(status)) return 'default';
    if (['pending', 'waiting_review', 'received'].includes(status)) return 'secondary';

    return 'outline';
}

function JsonBlock({ value }: { value: unknown }) {
    return (
        <pre className="max-h-[520px] overflow-auto rounded-md border bg-muted/40 p-3 text-xs leading-relaxed">
            {JSON.stringify(value ?? null, null, 2)}
        </pre>
    );
}

function useIntegrationList<T>(tab: TabKey, page: number, search: string, status: string) {
    const endpoint = tab === 'batches' ? 'import-batches' : tab;

    return useQuery({
        queryKey: ['integrations', tab, page, search, status],
        queryFn: async () => {
            const response = await http.get<Paginated<T>>(`/frieren-integrate/admin/${endpoint}`, {
                params: {
                    page,
                    per_page: 10,
                    search: search || undefined,
                    status: status === 'all' ? undefined : status,
                },
            });

            return response.data;
        },
    });
}

export default function IntegrationDashboard() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [tab, setTab] = useState<TabKey>('batches');
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('all');
    const [selected, setSelected] = useState<ImportBatch | IntegrationInbox | IntegrationOutbox | null>(null);
    const [rejectTarget, setRejectTarget] = useState<ImportBatch | null>(null);
    const [rejectionReason, setRejectionReason] = useState('');

    const overview = useQuery({
        queryKey: ['integrations', 'overview'],
        queryFn: async () => {
            const response = await http.get<{ data: IntegrationOverview }>('/frieren-integrate/admin/overview');

            return response.data.data;
        },
    });

    const batches = useIntegrationList<ImportBatch>('batches', page, search, status);
    const outbox = useIntegrationList<IntegrationOutbox>('outbox', page, search, status);
    const inbox = useIntegrationList<IntegrationInbox>('inbox', page, search, status);

    const activeQuery = tab === 'batches' ? batches : tab === 'outbox' ? outbox : inbox;
    const rows = activeQuery.data?.data ?? [];
    const total = activeQuery.data?.total ?? 0;
    const totalPages = Math.max(1, Math.ceil(total / 10));

    const statusOptions = useMemo(() => {
        if (tab === 'batches') return importStatuses;
        if (tab === 'outbox') return outboxStatuses;
        return inboxStatuses;
    }, [tab]);

    const invalidateAll = async () => {
        await queryClient.invalidateQueries({ queryKey: ['integrations'] });
    };

    const setupRabbit = useMutation({
        mutationFn: () => http.post('/frieren-integrate/admin/rabbitmq/setup'),
        onSuccess: () => toast({ title: 'rabbitmq setup successfully', description: 'RabbitMQ topology is ready.' }),
        onError: () => toast({ title: 'rabbitmq setup failed', description: 'Please check RabbitMQ connection.', variant: 'destructive' }),
    });

    const publishOnce = useMutation({
        mutationFn: () => http.post('/frieren-integrate/admin/outbox/publish-once'),
        onSuccess: async () => {
            toast({ title: 'publish outbox successfully', description: 'Pending outbox batch was processed.' });
            await invalidateAll();
        },
        onError: () => toast({ title: 'publish outbox failed', description: 'Please check RabbitMQ and outbox errors.', variant: 'destructive' }),
    });

    const retryOutbox = useMutation({
        mutationFn: (row: IntegrationOutbox) => http.post(`/frieren-integrate/admin/outbox/${row.id}/retry`),
        onSuccess: async () => {
            toast({ title: 'retry outbox successfully', description: 'Outbox event is pending again.' });
            await invalidateAll();
        },
        onError: () => toast({ title: 'retry outbox failed', description: 'Something went wrong.', variant: 'destructive' }),
    });

    const updateBatchStatus = useMutation({
        mutationFn: ({ row, nextStatus, reason }: { row: ImportBatch; nextStatus: string; reason?: string }) =>
            http.patch(`/frieren-integrate/admin/import-batches/${row.id}/status`, {
                status: nextStatus,
                rejection_reason: reason,
            }),
        onSuccess: async () => {
            toast({ title: 'update import batch successfully', description: 'Import batch status was updated.' });
            setRejectTarget(null);
            setRejectionReason('');
            await invalidateAll();
        },
        onError: () => toast({ title: 'update import batch failed', description: 'Something went wrong.', variant: 'destructive' }),
    });

    const switchTab = (nextTab: TabKey) => {
        setTab(nextTab);
        setPage(1);
        setStatus('all');
        setSelected(null);
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Integrations', href: '/portal/integrations' }]}>
            <Head title="Integrations" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-auto p-4 md:p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-semibold">Integrations</h1>
                        <p className="text-sm text-muted-foreground">Crawler ingestion, import staging, and RabbitMQ outbox operations.</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button variant="outline" className="gap-2" disabled={setupRabbit.isPending} onClick={() => setupRabbit.mutate()}>
                            <ServerCog className="size-4" />
                            Setup RabbitMQ
                        </Button>
                        <Button className="gap-2 bg-blue-600 text-white hover:bg-blue-700" disabled={publishOnce.isPending} onClick={() => publishOnce.mutate()}>
                            <Play className="size-4" />
                            Publish once
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
                        <CardContent className="text-sm text-muted-foreground">{overview.data?.api_prefix ?? 'api/integrations'}</CardContent>
                    </Card>
                    <Card className="rounded-lg">
                        <CardHeader className="pb-2">
                            <CardDescription>Outbox pending</CardDescription>
                            <CardTitle>{overview.data?.metrics.outbox_pending ?? 0}</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm text-muted-foreground">Ready to publish</CardContent>
                    </Card>
                    <Card className="rounded-lg">
                        <CardHeader className="pb-2">
                            <CardDescription>Waiting review</CardDescription>
                            <CardTitle>{overview.data?.metrics.batches_waiting_review ?? 0}</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm text-muted-foreground">Crawler imports</CardContent>
                    </Card>
                    <Card className="rounded-lg">
                        <CardHeader className="pb-2">
                            <CardDescription>RabbitMQ</CardDescription>
                            <CardTitle className="text-base">{overview.data?.rabbitmq.exchange ?? '-'}</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm text-muted-foreground">
                            {overview.data?.rabbitmq.host}:{overview.data?.rabbitmq.port} / {overview.data?.rabbitmq.queue}
                        </CardContent>
                    </Card>
                </div>

                <Card className="rounded-lg">
                    <CardHeader>
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <CardTitle className="text-base">Integration records</CardTitle>
                                <CardDescription>Review crawler events, import staging rows, and outbox delivery state.</CardDescription>
                            </div>
                            <Button variant="outline" size="sm" className="gap-2" onClick={() => void invalidateAll()}>
                                <RefreshCw className="size-4" />
                                Refresh
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex flex-wrap gap-2">
                            {tabs.map((item) => (
                                <Button key={item.key} variant={tab === item.key ? 'default' : 'outline'} size="sm" onClick={() => switchTab(item.key)}>
                                    {item.label}
                                </Button>
                            ))}
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <Input
                                className="max-w-xs"
                                placeholder="Search event, job, source..."
                                value={search}
                                onChange={(event) => {
                                    setSearch(event.target.value);
                                    setPage(1);
                                }}
                            />
                            <Select value={status} onValueChange={(value) => { setStatus(value); setPage(1); }}>
                                <SelectTrigger className="w-52">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All statuses</SelectItem>
                                    {statusOptions.map((item) => (
                                        <SelectItem key={item} value={item}>
                                            {item}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="overflow-hidden rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-20">ID</TableHead>
                                        <TableHead>Record</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Updated</TableHead>
                                        <TableHead className="w-[230px] text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {rows.length ? rows.map((row) => (
                                        <TableRow key={row.id}>
                                            <TableCell className="font-medium">#{row.id}</TableCell>
                                            <TableCell>
                                                {tab === 'batches' ? <BatchSummary row={row as ImportBatch} /> : tab === 'outbox' ? <OutboxSummary row={row as IntegrationOutbox} /> : <InboxSummary row={row as IntegrationInbox} />}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={statusVariant(row.status)}>{row.status}</Badge>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">{formatDateTime('updated_at' in row ? row.updated_at : row.created_at)}</TableCell>
                                            <TableCell>
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="outline" size="sm" className="gap-2" onClick={() => setSelected(row)}>
                                                        <Eye className="size-4" />
                                                        View
                                                    </Button>
                                                    {tab === 'batches' ? (
                                                        <>
                                                            <Button size="sm" className="bg-green-600 text-white hover:bg-green-700" onClick={() => updateBatchStatus.mutate({ row: row as ImportBatch, nextStatus: 'approved' })}>
                                                                Approve
                                                            </Button>
                                                            <Button variant="destructive" size="sm" onClick={() => setRejectTarget(row as ImportBatch)}>
                                                                Reject
                                                            </Button>
                                                        </>
                                                    ) : null}
                                                    {tab === 'outbox' ? (
                                                        <Button variant="outline" size="sm" className="gap-2" onClick={() => retryOutbox.mutate(row as IntegrationOutbox)}>
                                                            <RotateCcw className="size-4" />
                                                            Retry
                                                        </Button>
                                                    ) : null}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )) : (
                                        <TableRow>
                                            <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                                {activeQuery.isLoading ? 'Loading...' : 'No integration records.'}
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">{total} record(s)</span>
                            <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((current) => current - 1)}>
                                    Previous
                                </Button>
                                <span>Page {page} of {totalPages}</span>
                                <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((current) => current + 1)}>
                                    Next
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Dialog open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)}>
                    <DialogContent className="max-w-4xl">
                        <DialogHeader>
                            <DialogTitle>Integration record</DialogTitle>
                            <DialogDescription>Payload and operational details.</DialogDescription>
                        </DialogHeader>
                        {selected ? <RecordDetails record={selected} /> : null}
                    </DialogContent>
                </Dialog>

                <Dialog open={Boolean(rejectTarget)} onOpenChange={(open) => !open && setRejectTarget(null)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Reject import batch?</DialogTitle>
                            <DialogDescription>Record why this crawler result cannot be imported.</DialogDescription>
                        </DialogHeader>
                        <Textarea value={rejectionReason} onChange={(event) => setRejectionReason(event.target.value)} placeholder="Reason" />
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setRejectTarget(null)}>Cancel</Button>
                            <Button
                                variant="destructive"
                                disabled={!rejectTarget}
                                onClick={() => rejectTarget && updateBatchStatus.mutate({ row: rejectTarget, nextStatus: 'rejected', reason: rejectionReason })}
                            >
                                Reject
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}

function BatchSummary({ row }: { row: ImportBatch }) {
    return (
        <div className="space-y-1">
            <div className="font-medium">{row.external_job_id}</div>
            <div className="text-sm text-muted-foreground">{row.entity_type} / {row.source_url ?? '-'}</div>
        </div>
    );
}

function OutboxSummary({ row }: { row: IntegrationOutbox }) {
    return (
        <div className="space-y-1">
            <div className="font-medium">{row.event_type}</div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{row.routing_key}</span>
                {row.attempts > 0 ? <span>Attempts: {row.attempts}</span> : null}
                {row.last_error ? <AlertTriangle className="size-4 text-red-600" /> : null}
            </div>
        </div>
    );
}

function InboxSummary({ row }: { row: IntegrationInbox }) {
    return (
        <div className="space-y-1">
            <div className="font-medium">{row.event_type}</div>
            <div className="text-sm text-muted-foreground">{row.producer} / {row.event_id}</div>
        </div>
    );
}

function RecordDetails({ record }: { record: ImportBatch | IntegrationInbox | IntegrationOutbox }) {
    if ('normalized_data' in record) {
        return (
            <div className="grid gap-4">
                <JsonBlock value={{
                    id: record.id,
                    external_job_id: record.external_job_id,
                    source_url: record.source_url,
                    entity_type: record.entity_type,
                    status: record.status,
                    rejection_reason: record.rejection_reason,
                    created_at: record.created_at,
                    updated_at: record.updated_at,
                }} />
                <JsonBlock value={{ normalized_data: record.normalized_data, validation_result: record.validation_result }} />
            </div>
        );
    }

    return (
        <div className="grid gap-4">
            <JsonBlock value={record} />
        </div>
    );
}
