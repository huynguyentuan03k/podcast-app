import { PageTransition, TransitionLink, useLoadingNavigate } from '@/components/custom/page-transition';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/hooks/use-toast';
import http from '@/http/client';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@/lib/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { episodeConfig, type Episode } from '../shema';

function DetailItem({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="space-y-1">
            <p className="text-xs text-muted-foreground">{label}:</p>
            <div className="text-sm font-medium">{children || <span className="italic text-muted-foreground">Not available</span>}</div>
        </div>
    );
}

function formatDate(value: Episode['created_at']) {
    if (!value) return null;

    return new Intl.DateTimeFormat('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(value));
}

function formatDuration(value: Episode['duration']) {
    const seconds = Number(value ?? 0);
    if (!seconds) return null;

    return `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;
}

export default function ShowEpisode({ record }: { record: Episode }) {
    const navigate = useNavigate();
    const loadingNavigate = useLoadingNavigate();
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const deleteMutation = useMutation({
        mutationFn: () => http.delete(`${episodeConfig.endpoint.replace('/api/', '/')}/${record.id}`),
        onSuccess: async () => {
            toast({ title: 'delete episode successfully', description: 'episode has been deleted.' });
            await queryClient.invalidateQueries({ queryKey: ['episodes'] });
            navigate(episodeConfig.basePath);
        },
        onError: () => {
            toast({ title: 'delete episode failed', description: 'Something went wrong', variant: 'destructive' });
        },
    });

    return (
        <AppLayout breadcrumbs={[...episodeConfig.breadcrumbs, { title: `ID: ${record.id}`, href: '#' }]}>
            <Head title={`Episode #${record.id}`} />
            <PageTransition className="flex h-full flex-1 flex-col gap-4 overflow-auto p-4 md:p-6">
                <div className="flex items-start justify-between gap-4">
                    <h1 className="text-2xl font-semibold">Episode Details</h1>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" className="gap-2 shadow-sm" onClick={() => loadingNavigate(episodeConfig.basePath)}>
                            <ArrowLeft className="size-4" />
                            Back
                        </Button>
                        <Button
                            variant="destructive"
                            className="gap-2 shadow-sm"
                            disabled={deleteMutation.isPending}
                            onClick={() => {
                                if (confirm(`Delete episode #${record.id}?`)) deleteMutation.mutate();
                            }}
                        >
                            <Trash2 className="size-4" />
                            Delete
                        </Button>
                        <Button asChild className="gap-2 bg-blue-600 text-white shadow-sm hover:bg-blue-700 focus-visible:ring-blue-500">
                            <TransitionLink href={`${episodeConfig.basePath}/${record.id}/edit`}>
                                <Pencil className="size-4" />
                                Edit
                            </TransitionLink>
                        </Button>
                    </div>
                </div>

                <div className="rounded-lg border bg-card p-6 shadow-sm">
                    <h2 className="mb-8 text-base font-semibold">General Information</h2>
                    <div className="grid gap-x-12 gap-y-8 md:grid-cols-2 xl:grid-cols-3">
                        <DetailItem label="ID">{record.id}</DetailItem>
                        <DetailItem label="Title">{record.title}</DetailItem>
                        <DetailItem label="Slug">{record.slug}</DetailItem>
                        <DetailItem label="Podcast">{record.podcast?.title ?? `#${record.podcast_id}`}</DetailItem>
                        <DetailItem label="Duration">{formatDuration(record.duration)}</DetailItem>
                        <DetailItem label="Created At">{formatDate(record.created_at)}</DetailItem>
                        <DetailItem label="Updated At">{formatDate(record.updated_at)}</DetailItem>
                        <div className="space-y-1 md:col-span-2 xl:col-span-3">
                            <p className="text-xs text-muted-foreground">Audio URL:</p>
                            {record.audio_url || record.audio_path ? (
                                <a href={record.audio_url ?? record.audio_path ?? '#'} className="break-all text-sm font-medium text-blue-600 hover:underline" target="_blank" rel="noreferrer">
                                    {record.audio_path ?? record.audio_url}
                                </a>
                            ) : (
                                <span className="text-sm italic text-muted-foreground">Not available</span>
                            )}
                        </div>
                        <div className="space-y-1 md:col-span-2 xl:col-span-3">
                            <p className="text-xs text-muted-foreground">Description:</p>
                            <p className="whitespace-pre-wrap text-sm font-medium">{record.description || <span className="italic text-muted-foreground">Not available</span>}</p>
                        </div>
                    </div>
                </div>
            </PageTransition>
        </AppLayout>
    );
}
