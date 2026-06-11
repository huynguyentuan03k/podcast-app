import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import http from '@/http/client';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { LoaderCircle } from 'lucide-react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { type EpisodeForm, type PodcastOption } from '../shema';

type ApiErrorResponse = {
    message: string;
    errors?: Record<string, string[]>;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Episodes', href: '/portal/episodes' },
    { title: 'Create', href: '/portal/episodes/create' },
];

function toFormData(data: EpisodeForm) {
    const formData = new FormData();

    formData.append('title', data.title);
    formData.append('slug', data.slug);
    formData.append('podcast_id', String(data.podcast_id));
    if (data.description) formData.append('description', data.description);
    if (data.duration) formData.append('duration', data.duration);
    if (data.audio_path?.[0]) formData.append('audio_path', data.audio_path[0]);
    if (data.cover_image?.[0]) formData.append('cover_image', data.cover_image[0]);

    return formData;
}

export default function CreateEpisode() {
    const form = useForm<EpisodeForm>({
        defaultValues: {
            title: '',
            description: '',
            slug: '',
            podcast_id: 0,
            duration: '',
        },
    });

    const { data: podcastOptions = [] } = useQuery({
        queryKey: ['podcasts'],
        queryFn: async () => {
            const response = await http.get<{ data: PodcastOption[] }>('/podcasts');
            return response.data.data;
        },
    });

    const mutation = useMutation({
        mutationFn: (episode: EpisodeForm) => http.post('/episodes', toFormData(episode)),
        onSuccess: () => router.visit('/portal/episodes'),
        onError: (error: AxiosError<ApiErrorResponse>) => {
            Object.entries(error.response?.data.errors ?? {}).forEach(([key, messages]) => {
                form.setError(key as keyof EpisodeForm, { message: messages[0] });
            });
        },
    });

    const onSubmit: SubmitHandler<EpisodeForm> = (data) => mutation.mutate(data);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create episode" />
            <div className="p-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Create Episode</CardTitle>
                        <CardDescription>Store a new episode through the episode API controller.</CardDescription>
                    </CardHeader>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <CardContent>
                            <Form {...form}>
                                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                    <FormField
                                        control={form.control}
                                        name="title"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Title</FormLabel>
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
                                                <FormLabel>Slug</FormLabel>
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
                                                <FormLabel>Podcast</FormLabel>
                                                <Select
                                                    value={field.value ? String(field.value) : ''}
                                                    onValueChange={(value) => field.onChange(Number(value))}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select podcast" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {podcastOptions.map((podcast) => (
                                                            <SelectItem key={podcast.id} value={String(podcast.id)}>
                                                                {podcast.title}
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
                                            <FormItem className="md:col-span-2">
                                                <FormLabel>Description</FormLabel>
                                                <FormControl>
                                                    <Textarea placeholder="Episode description" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="duration"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Duration</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="00:03:15" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="audio_path"
                                        render={({ field: { onChange, value, ...field } }) => (
                                            <FormItem>
                                                <FormLabel>Audio file</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="file"
                                                        accept="audio/*"
                                                        {...field}
                                                        onChange={(event) => onChange(event.target.files)}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="cover_image"
                                        render={({ field: { onChange, value, ...field } }) => (
                                            <FormItem>
                                                <FormLabel>Cover image</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="file"
                                                        accept="image/*"
                                                        {...field}
                                                        onChange={(event) => onChange(event.target.files)}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </Form>
                        </CardContent>
                        <CardFooter className="justify-end gap-2">
                            <Button type="button" variant="outline" onClick={() => router.visit('/portal/episodes')}>
                                Back
                            </Button>
                            <Button type="submit" disabled={mutation.isPending}>
                                {mutation.isPending && <LoaderCircle className="mr-2 size-4 animate-spin" />}
                                Save
                            </Button>
                        </CardFooter>
                    </form>
                </Card>
            </div>
        </AppLayout>
    );
}
