import { SpinnerLoading } from '@/components/custom/SpinnerLoading';
import { PageTransition, useLoadingNavigate } from '@/components/custom/page-transition';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/components/ui/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import http from '@/http/client';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@/lib/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { ArrowLeft, LoaderCircle, Save } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useForm, type Resolver } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { EpisodeFormSchema, episodeConfig, type Episode, type EpisodeForm, type PodcastOption } from '../shema';
import AudioUrlValidator, { type AudioValidationStatus } from '../form/AudioUrlValidator';

type LaravelValidationError = {
    message?: string;
    errors?: Record<string, string[]>;
};

export default function EditEpisode({ record }: { record: Episode }) {
    const navigate = useNavigate();
    const loadingNavigate = useLoadingNavigate();
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [audioStatus, setAudioStatus] = useState<AudioValidationStatus>(record.audio_path ? 'valid' : 'idle');

    const { data: podcastOptions = [] } = useQuery({
        queryKey: ['podcasts', 'options'],
        queryFn: async () => {
            const response = await http.get<{ data: PodcastOption[] }>('/podcasts');

            return response.data.data ?? [];
        },
    });

    const defaultValues = useMemo<EpisodeForm>(
        () => ({
            title: record.title ?? '',
            slug: record.slug ?? '',
            description: record.description ?? '',
            podcast_id: record.podcast_id,
            audio_path: record.audio_path ?? record.audio_url ?? '',
            duration: record.duration ? String(record.duration) : '0',
        }),
        [record],
    );

    const form = useForm<EpisodeForm>({
        resolver: zodResolver(EpisodeFormSchema) as Resolver<EpisodeForm>,
        values: defaultValues,
    });

    const mutation = useMutation({
        mutationFn: async (values: EpisodeForm) => http.put(`/episodes/${record.id}`, values),
        onSuccess: async () => {
            toast({ title: 'update episode successfully', description: 'episode has been updated.' });
            await queryClient.invalidateQueries({ queryKey: ['episodes'] });
            navigate(episodeConfig.basePath);
        },
        onError: (error: AxiosError<LaravelValidationError>) => {
            toast({
                title: 'update episode failed',
                description: error.response?.data?.message || 'Something went wrong',
                variant: 'destructive',
            });
            Object.entries(error.response?.data?.errors ?? {}).forEach(([field, messages]) => {
                form.setError(field as keyof EpisodeForm, { type: 'server', message: messages[0] ?? 'Invalid value.' });
            });
        },
    });

    if (!record) {
        return <SpinnerLoading />;
    }

    return (
        <AppLayout breadcrumbs={[...episodeConfig.breadcrumbs, { title: `ID: ${record.id}`, href: `${episodeConfig.basePath}/${record.id}/show` }, { title: 'Edit Episode', href: '#' }]}>
            <Head title={`Edit Episode #${record.id}`} />
            <PageTransition className="flex h-full flex-1 flex-col gap-4 overflow-auto p-4 md:p-6">
                <div className="flex items-start justify-between gap-4">
                    <h1 className="text-2xl font-semibold">Episodes Edit</h1>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" className="gap-2 shadow-sm" onClick={() => loadingNavigate(episodeConfig.basePath)}>
                            <ArrowLeft className="size-4" />
                            Cancel
                        </Button>
                        <Button
                            form="episode-form"
                            type="submit"
                            disabled={mutation.isPending || audioStatus !== 'valid'}
                            className="gap-2 bg-blue-600 text-white shadow-sm hover:bg-blue-700 focus-visible:ring-blue-500"
                        >
                            {mutation.isPending ? <LoaderCircle className="size-4 animate-spin" /> : <Save className="size-4" />}
                            Save
                        </Button>
                    </div>
                </div>

                <Form {...form}>
                    <form id="episode-form" onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
                        <div className="rounded-lg border bg-card p-6 shadow-sm">
                            <div className="grid grid-cols-1 gap-x-8 gap-y-6 lg:grid-cols-3">
                                <FormField
                                    control={form.control}
                                    name="title"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Title <span className="text-destructive">*</span>
                                            </FormLabel>
                                            <FormControl>
                                                <Input placeholder="Episode title" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="slug"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Slug <span className="text-destructive">*</span>
                                            </FormLabel>
                                            <FormControl>
                                                <Input placeholder="episode-slug" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="podcast_id"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Podcast <span className="text-destructive">*</span>
                                            </FormLabel>
                                            <Select value={field.value ? String(field.value) : ''} onValueChange={(value) => field.onChange(Number(value))}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select podcast" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {podcastOptions.map((podcast) => (
                                                        <SelectItem key={podcast.id} value={String(podcast.id)}>
                                                            {podcast.title ?? `#${podcast.id}`}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem className="lg:col-span-3">
                                            <FormLabel>Description</FormLabel>
                                            <FormControl>
                                                <Textarea className="min-h-24" placeholder="Episode description" {...field} value={field.value ?? ''} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="audio_path"
                                    render={({ field }) => (
                                        <FormItem className="lg:col-span-3">
                                            <FormLabel>
                                                Audio URL <span className="text-destructive">*</span>
                                            </FormLabel>
                                            <FormControl>
                                                <AudioUrlValidator
                                                    value={field.value}
                                                    status={audioStatus}
                                                    duration={Number(form.watch('duration') ?? 0)}
                                                    onChange={field.onChange}
                                                    onValidated={(status, duration) => {
                                                        setAudioStatus(status);
                                                        form.setValue('duration', String(duration ?? 0), { shouldValidate: true });
                                                    }}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>
                    </form>
                </Form>
            </PageTransition>
        </AppLayout>
    );
}
