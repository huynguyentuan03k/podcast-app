import { DataTableV1 } from '@/components/custom/data-table-v1';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/hooks/use-toast';
import http from '@/http/client';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@/lib/navigation';
import { getEpisodeColumns } from '@/pages/episodes/overview/columns';
import { normalizeEpisodeIndexResponse } from '@/pages/episodes/overview/filters';
import { defaultEpisodeSorting } from '@/pages/episodes/overview/sorting';
import type { Episode } from '@/pages/episodes/shema';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { podcastConfig, type Podcast } from '../shema';

function DetailItem({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="space-y-1">
            <p className="text-xs text-muted-foreground">{label}:</p>
            <div className="text-sm font-medium">{children || <span className="italic text-muted-foreground">Not available</span>}</div>
        </div>
    );
}

function formatDate(value: Podcast['created_at']) {
    if (!value) return null;

    return new Intl.DateTimeFormat('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(value));
}

function buildPodcastEpisodesUrl(podcastId: number, pageIndex: number, pageSize: number) {
    const params = new URLSearchParams({
        page: String(pageIndex + 1),
        per_page: String(pageSize),
        'filter[podcast_id]': String(podcastId),
    });

    return `/episodes?${params.toString()}`;
}

export default function ShowPodcast({ record }: { record: Podcast }) {
    const navigate = useNavigate();
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const deleteMutation = useMutation({
        mutationFn: () => http.delete(`${podcastConfig.endpoint.replace('/api/', '/')}/${record.id}`),
        onSuccess: async () => {
            toast({ title: 'delete podcast successfully', description: 'podcast has been deleted.' });
            await queryClient.invalidateQueries({ queryKey: ['podcasts'] });
            navigate(podcastConfig.basePath);
        },
        onError: () => {
            toast({ title: 'delete podcast failed', description: 'Something went wrong', variant: 'destructive' });
        },
    });

    const episodeColumns = useMemo(
        () => getEpisodeColumns({ deletingId: null, onDelete: () => undefined, onRequestDelete: () => undefined }).filter((column) => column.id !== 'actions'),
        [],
    );

    return (
        <AppLayout breadcrumbs={[...podcastConfig.breadcrumbs, { title: `ID: ${record.id}`, href: '#' }]}>
            <Head title={`Podcast #${record.id}`} />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-auto p-4 md:p-6">
                <div className="flex items-start justify-between gap-4">
                    <h1 className="text-2xl font-semibold">Podcast Details</h1>
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
                                if (confirm(`Delete podcast #${record.id}?`)) deleteMutation.mutate();
                            }}
                        >
                            <Trash2 className="size-4" />
                            Delete
                        </Button>
                        <Button asChild className="gap-2 bg-blue-600 text-white shadow-sm hover:bg-blue-700 focus-visible:ring-blue-500">
                            <Link href={`${podcastConfig.basePath}/${record.id}/edit`}>
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
                        <DetailItem label="Slug">{record.slug}</DetailItem>
                        <DetailItem label="Publisher">{record.publisher?.name}</DetailItem>
                        <DetailItem label="Episodes">{record.episodes_count ?? 0}</DetailItem>
                        <DetailItem label="Created At">{formatDate(record.created_at)}</DetailItem>
                        <DetailItem label="Updated At">{formatDate(record.updated_at)}</DetailItem>
                        <div className="space-y-2 md:col-span-2 xl:col-span-3">
                            <p className="text-xs text-muted-foreground">Cover:</p>
                            {record.cover_url ? (
                                <img src={record.cover_url} alt={record.title ?? 'Podcast cover'} className="h-48 w-80 rounded-lg object-cover shadow-sm" />
                            ) : (
                                <p className="text-sm italic text-muted-foreground">Not available</p>
                            )}
                        </div>
                        <div className="space-y-2 md:col-span-2 xl:col-span-3">
                            <p className="text-xs text-muted-foreground">Authors:</p>
                            <div className="flex flex-wrap gap-2">
                                {record.authors?.length ? record.authors.map((author) => <Badge key={author.id} variant="secondary">{author.name ?? `#${author.id}`}</Badge>) : <span className="text-sm italic text-muted-foreground">Not available</span>}
                            </div>
                        </div>
                        <div className="space-y-2 md:col-span-2 xl:col-span-3">
                            <p className="text-xs text-muted-foreground">Categories:</p>
                            <div className="flex flex-wrap gap-2">
                                {record.categories?.length ? record.categories.map((category) => <Badge key={category.id} variant="outline">{category.name.en ?? category.name.vi ?? `#${category.id}`}</Badge>) : <span className="text-sm italic text-muted-foreground">Not available</span>}
                            </div>
                        </div>
                        <div className="space-y-1 md:col-span-2 xl:col-span-3">
                            <p className="text-xs text-muted-foreground">Description:</p>
                            <p className="whitespace-pre-wrap text-sm font-medium">{record.description || <span className="italic text-muted-foreground">Not available</span>}</p>
                        </div>
                        <div className="space-y-1 md:col-span-2 xl:col-span-3">
                            <p className="text-xs text-muted-foreground">Content:</p>
                            <p className="whitespace-pre-wrap text-sm font-medium">{record.content || <span className="italic text-muted-foreground">Not available</span>}</p>
                        </div>
                    </div>
                </div>

                <div className="rounded-lg border bg-card p-6 shadow-sm">
                    <h2 className="mb-2 text-base font-semibold">Episodes</h2>
                    <p className="mb-6 text-sm text-muted-foreground">Episodes that belong to this podcast.</p>
                    <DataTableV1<Episode, unknown>
                        title={undefined}
                        columns={episodeColumns}
                        queryKey={['podcast-episodes', record.id]}
                        initialSorting={defaultEpisodeSorting}
                        initialColumnVisibility={{ podcast_title: false }}
                        searchPlaceholder="Search episodes"
                        queryFn={async (request) => {
                            const response = await http.get(buildPodcastEpisodesUrl(record.id, request.pageIndex, request.pageSize));

                            return normalizeEpisodeIndexResponse(response.data);
                        }}
                    />
                </div>
            </div>
        </AppLayout>
    );
}
