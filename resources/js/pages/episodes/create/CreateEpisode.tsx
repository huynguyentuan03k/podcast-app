import { Button } from '@/components/ui/button';
import { PageTransition, useLoadingNavigate } from '@/components/custom/page-transition';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/hooks/use-toast';
import http from '@/http/client';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@/lib/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { ArrowLeft, LoaderCircle, Plus, Save, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { episodeConfig, type PodcastOption } from '../shema';
import AudioUrlValidator, { type AudioValidationStatus } from '../form/AudioUrlValidator';

type LaravelValidationError = {
    message?: string;
    errors?: Record<string, string[]>;
};

type EpisodeDraft = {
    localId: string;
    title: string;
    slug: string;
    description: string;
    podcast_id: number;
    audio_path: string;
    duration: number | null;
    status: AudioValidationStatus;
};

function newDraft(index = 1): EpisodeDraft {
    return {
        localId: crypto.randomUUID(),
        title: '',
        slug: '',
        description: '',
        podcast_id: 0,
        audio_path: '',
        duration: null,
        status: 'idle',
    };
}

function incrementIndexedValue(value: string, index: number, separator: ' ' | '-') {
    const trimmed = value.trim();

    if (!trimmed) {
        return '';
    }

    if (/\d+$/.test(trimmed)) {
        return trimmed.replace(/\d+$/, String(index));
    }

    return `${trimmed}${separator}${index}`;
}

function validateDrafts(drafts: EpisodeDraft[]) {
    return drafts.every((draft) => draft.title.trim() && draft.slug.trim() && draft.podcast_id && draft.audio_path.trim() && draft.status === 'valid');
}

export default function CreateEpisode() {
    const navigate = useNavigate();
    const loadingNavigate = useLoadingNavigate();
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [drafts, setDrafts] = useState<EpisodeDraft[]>([newDraft()]);
    const [pendingFocusId, setPendingFocusId] = useState<string | null>(null);
    const audioUrlRefs = useRef<Record<string, HTMLTextAreaElement | null>>({});

    const { data: podcastOptions = [] } = useQuery({
        queryKey: ['podcasts', 'options'],
        queryFn: async () => {
            const response = await http.get<{ data: PodcastOption[] }>('/podcasts');

            return response.data.data ?? [];
        },
    });

    const canSubmit = useMemo(() => validateDrafts(drafts), [drafts]);

    const updateDraft = (localId: string, patch: Partial<EpisodeDraft>) => {
        setDrafts((current) => current.map((draft) => (draft.localId === localId ? { ...draft, ...patch } : draft)));
    };

    useEffect(() => {
        if (!pendingFocusId) {
            return;
        }

        window.requestAnimationFrame(() => {
            audioUrlRefs.current[pendingFocusId]?.focus();
            audioUrlRefs.current[pendingFocusId]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setPendingFocusId(null);
        });
    }, [pendingFocusId, drafts.length]);

    const addDraft = () => {
        setDrafts((current) => {
            const nextIndex = current.length + 1;
            const firstDraft = current[0] ?? newDraft();
            const nextDraft: EpisodeDraft = {
                ...newDraft(nextIndex),
                title: incrementIndexedValue(firstDraft.title, nextIndex, ' '),
                slug: incrementIndexedValue(firstDraft.slug, nextIndex, '-'),
                description: firstDraft.description,
                podcast_id: firstDraft.podcast_id,
                audio_path: '',
                duration: null,
                status: 'idle',
            };

            setPendingFocusId(nextDraft.localId);

            return [...current, nextDraft];
        });
    };

    const removeDraft = (localId: string) => {
        delete audioUrlRefs.current[localId];
        setDrafts((current) => (current.length === 1 ? current : current.filter((draft) => draft.localId !== localId)));
    };

    const mutation = useMutation({
        mutationFn: async (items: EpisodeDraft[]) => {
            const [first, ...rest] = items;

            return http.post('/episodes', {
                title: first.title,
                slug: first.slug,
                description: first.description,
                podcast_id: first.podcast_id,
                audio_path: first.audio_path,
                duration: String(first.duration ?? 0),
                episodes: rest.map((episode) => ({
                    title: episode.title,
                    slug: episode.slug,
                    description: episode.description,
                    podcast_id: episode.podcast_id,
                    audio_path: episode.audio_path,
                    duration: String(episode.duration ?? 0),
                })),
            });
        },
        onSuccess: async () => {
            toast({ title: 'create episodes successfully', description: `${drafts.length} episode(s) have been stored.` });
            await queryClient.invalidateQueries({ queryKey: ['episodes'] });
            navigate(episodeConfig.basePath);
        },
        onError: (error: AxiosError<LaravelValidationError>) => {
            toast({
                title: 'create episodes failed',
                description: error.response?.data?.message || 'Something went wrong',
                variant: 'destructive',
            });
        },
    });

    return (
        <AppLayout breadcrumbs={[...episodeConfig.breadcrumbs, { title: 'Create Episode', href: '#' }]}>
            <Head title="Create Episode" />
            <PageTransition className="flex h-full flex-1 flex-col gap-4 overflow-auto p-4 md:p-6">
                <div className="flex items-start justify-between gap-4">
                    <h1 className="text-2xl font-semibold">Episodes Create</h1>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" className="gap-2 shadow-sm" onClick={() => loadingNavigate(episodeConfig.basePath)}>
                            <ArrowLeft className="size-4" />
                            Back
                        </Button>
                        <Button type="button" variant="outline" className="gap-2" onClick={addDraft}>
                            <Plus className="size-4" />
                            Append
                        </Button>
                        <Button
                            type="button"
                            disabled={!canSubmit || mutation.isPending}
                            className="gap-2 bg-blue-600 text-white shadow-sm hover:bg-blue-700 focus-visible:ring-blue-500"
                            onClick={() => mutation.mutate(drafts)}
                        >
                            {mutation.isPending ? <LoaderCircle className="size-4 animate-spin" /> : <Save className="size-4" />}
                            Save
                        </Button>
                    </div>
                </div>

                <div className="rounded-lg border bg-card p-6 shadow-sm">
                    <div className="space-y-8">
                        {drafts.map((draft, index) => (
                            <div key={draft.localId} className="rounded-lg border p-5">
                                <div className="mb-5 flex items-center justify-between">
                                    <div>
                                        <h2 className="text-base font-semibold">Episode #{index + 1}</h2>
                                        <p className="text-sm text-muted-foreground">Audio URL must be checked before saving.</p>
                                    </div>
                                    <Button type="button" variant="destructive" size="sm" className="gap-2" disabled={drafts.length === 1} onClick={() => removeDraft(draft.localId)}>
                                        <Trash2 className="size-4" />
                                        Remove
                                    </Button>
                                </div>

                                <div className="grid grid-cols-1 gap-x-8 gap-y-6 lg:grid-cols-3">
                                    <div className="space-y-2">
                                        <Label>
                                            Title <span className="text-destructive">*</span>
                                        </Label>
                                        <Input value={draft.title} placeholder="Episode title" onChange={(event) => updateDraft(draft.localId, { title: event.target.value })} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>
                                            Slug <span className="text-destructive">*</span>
                                        </Label>
                                        <Input value={draft.slug} placeholder="episode-slug" onChange={(event) => updateDraft(draft.localId, { slug: event.target.value })} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>
                                            Podcast <span className="text-destructive">*</span>
                                        </Label>
                                        <Select value={draft.podcast_id ? String(draft.podcast_id) : ''} onValueChange={(value) => updateDraft(draft.localId, { podcast_id: Number(value) })}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select podcast" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {podcastOptions.map((podcast) => (
                                                    <SelectItem key={podcast.id} value={String(podcast.id)}>
                                                        {podcast.title ?? `#${podcast.id}`}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2 lg:col-span-3">
                                        <Label>Description</Label>
                                        <Textarea value={draft.description} className="min-h-24" placeholder="Episode description" onChange={(event) => updateDraft(draft.localId, { description: event.target.value })} />
                                    </div>
                                    <div className="space-y-2 lg:col-span-3">
                                        <Label>
                                            Audio URL <span className="text-destructive">*</span>
                                        </Label>
                                        <AudioUrlValidator
                                            ref={(element) => {
                                                audioUrlRefs.current[draft.localId] = element;
                                            }}
                                            value={draft.audio_path}
                                            status={draft.status}
                                            duration={draft.duration}
                                            onChange={(value) => updateDraft(draft.localId, { audio_path: value })}
                                            onValidated={(status, duration) => updateDraft(draft.localId, { status, duration })}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </PageTransition>
        </AppLayout>
    );
}
