import { SpinnerLoading } from '@/components/custom/SpinnerLoading';
import { MultipleSelect, type MultipleSelectOption } from '@/components/custom/multiple-select';
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
import { Editor } from '@tinymce/tinymce-react';
import type { AxiosError } from 'axios';
import { ArrowLeft, LoaderCircle, Save } from 'lucide-react';
import { useMemo } from 'react';
import { useForm, type Resolver } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import 'tinymce/tinymce';
import 'tinymce/icons/default';
import 'tinymce/models/dom';
import 'tinymce/plugins/autolink';
import 'tinymce/plugins/code';
import 'tinymce/plugins/image';
import 'tinymce/plugins/link';
import 'tinymce/plugins/lists';
import 'tinymce/plugins/table';
import 'tinymce/plugins/wordcount';
import 'tinymce/skins/content/default/content.css';
import 'tinymce/skins/ui/oxide/skin.css';
import 'tinymce/themes/silver';
import { PodcastFormSchema, podcastConfig, type Podcast, type PodcastForm as PodcastFormValues } from '../shema';

type LaravelValidationError = {
    message?: string;
    errors?: Record<string, string[]>;
};

type Option = {
    id: number;
    name: string | { en?: string | null; vi?: string | null } | null;
};

type PodcastFormProps = {
    mode: 'create' | 'edit';
    podcast?: Podcast;
    isLoading?: boolean;
};

function optionLabel(option: Option) {
    if (typeof option.name === 'string') {
        return option.name;
    }

    return option.name?.en ?? option.name?.vi ?? `#${option.id}`;
}

function buildPodcastPayload(values: PodcastFormValues) {
    const formData = new FormData();

    formData.append('title', values.title);
    formData.append('slug', values.slug);
    formData.append('publisher_id', String(values.publisher_id));
    formData.append('description', values.description ?? '');
    formData.append('content', values.content ?? '');

    values.author_ids.forEach((id) => formData.append('author_ids[]', String(id)));
    values.category_ids.forEach((id) => formData.append('category_ids[]', String(id)));

    if (values.cover_image instanceof File) {
        formData.append('cover_image', values.cover_image);
    }

    return formData;
}

function applyLaravelErrors(form: ReturnType<typeof useForm<PodcastFormValues>>, error: AxiosError<LaravelValidationError>) {
    Object.entries(error.response?.data?.errors ?? {}).forEach(([field, messages]) => {
        form.setError(field as keyof PodcastFormValues, {
            type: 'server',
            message: messages[0] ?? 'Invalid value.',
        });
    });
}

function TinyMceEditor({ value, onChange }: { value: string; onChange: (value: string) => void }) {
    return (
        <Editor
            value={value}
            licenseKey="gpl"
            onEditorChange={onChange}
            init={{
                height: 420,
                menubar: true,
                branding: false,
                promotion: false,
                skin: false,
                content_css: false,
                plugins: 'autolink lists link image table code wordcount',
                toolbar:
                    'undo redo | blocks | bold italic underline | alignleft aligncenter alignright alignjustify | bullist numlist | outdent indent | link image table | code',
            }}
        />
    );
}

export default function PodcastForm({ mode, podcast, isLoading }: PodcastFormProps) {
    const navigate = useNavigate();
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const title = mode === 'create' ? 'Create Podcast' : 'Edit Podcast';

    const { data: publishers = [] } = useQuery({
        queryKey: ['publishers', 'options'],
        queryFn: async () => {
            const response = await http.get<{ data: Option[] }>('/publishers');

            return response.data.data ?? [];
        },
    });

    const { data: authors = [] } = useQuery({
        queryKey: ['authors', 'options'],
        queryFn: async () => {
            const response = await http.get<{ data: Option[] }>('/authors');

            return response.data.data ?? [];
        },
    });

    const { data: categories = [] } = useQuery({
        queryKey: ['categories', 'options'],
        queryFn: async () => {
            const response = await http.get<{ data: Option[] }>('/categories');

            return response.data.data ?? [];
        },
    });

    const defaultValues = useMemo<PodcastFormValues>(
        () => ({
            title: podcast?.title ?? '',
            slug: podcast?.slug ?? '',
            publisher_id: podcast?.publisher?.id ?? 0,
            description: podcast?.description ?? '',
            content: podcast?.content ?? '',
            cover_image: podcast?.cover_url ?? undefined,
            author_ids: podcast?.authors?.map((author) => author.id) ?? [],
            category_ids: podcast?.categories?.map((category) => category.id) ?? [],
        }),
        [podcast],
    );
    const authorOptions = useMemo<MultipleSelectOption[]>(
        () => authors.map((author) => ({ value: author.id, label: optionLabel(author) })),
        [authors],
    );
    const categoryOptions = useMemo<MultipleSelectOption[]>(
        () => categories.map((category) => ({ value: category.id, label: optionLabel(category) })),
        [categories],
    );

    const form = useForm<PodcastFormValues>({
        resolver: zodResolver(PodcastFormSchema) as Resolver<PodcastFormValues>,
        values: defaultValues,
    });

    const mutation = useMutation({
        mutationFn: async (values: PodcastFormValues) => {
            const payload = buildPodcastPayload(values);
            const endpoint = podcastConfig.endpoint.replace('/api/', '/');

            return mode === 'create'
                ? http.post<Podcast>(endpoint, payload, { headers: { 'Content-Type': 'multipart/form-data' } })
                : http.post<Podcast>(`${endpoint}/${podcast?.id}`, payload, { headers: { 'Content-Type': 'multipart/form-data' } });
        },
        onSuccess: async () => {
            toast({
                title: mode === 'create' ? 'create podcast successfully' : 'update podcast successfully',
                description: mode === 'create' ? 'podcast has been store.' : 'podcast has been updated.',
            });
            await queryClient.invalidateQueries({ queryKey: ['podcasts'] });
            navigate(podcastConfig.basePath);
        },
        onError: (error: AxiosError<LaravelValidationError>) => {
            toast({
                title: mode === 'create' ? 'create podcast failed' : 'update podcast failed',
                description: error.response?.data?.message || 'Something went wrong',
                variant: 'destructive',
            });
            applyLaravelErrors(form, error);
        },
    });

    if (isLoading) {
        return <SpinnerLoading />;
    }

    return (
        <AppLayout breadcrumbs={[...podcastConfig.breadcrumbs, ...(podcast ? [{ title: `ID: ${podcast.id}`, href: `${podcastConfig.basePath}/${podcast.id}/show` }] : []), { title, href: '#' }]}>
            <Head title={title} />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-auto p-4 md:p-6">
                <div className="flex items-start justify-between gap-4">
                    <h1 className="text-2xl font-semibold">{mode === 'create' ? 'Podcasts Create' : 'Podcasts Edit'}</h1>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" className="gap-2 shadow-sm" onClick={() => navigate(-1)}>
                            <ArrowLeft className="size-4" />
                            Cancel
                        </Button>
                        <Button
                            form="podcast-form"
                            type="submit"
                            disabled={mutation.isPending}
                            className="gap-2 bg-blue-600 text-white shadow-sm hover:bg-blue-700 focus-visible:ring-blue-500"
                        >
                            {mutation.isPending ? <LoaderCircle className="size-4 animate-spin" /> : <Save className="size-4" />}
                            Save
                        </Button>
                    </div>
                </div>

                <Form {...form}>
                    <form id="podcast-form" onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
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
                                                <Input placeholder="Please enter a title" {...field} />
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
                                                <Input placeholder="please-enter-a-slug" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="publisher_id"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Publisher <span className="text-destructive">*</span>
                                            </FormLabel>
                                            <Select value={field.value ? String(field.value) : ''} onValueChange={(value) => field.onChange(Number(value))}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select publisher" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {publishers.map((publisher) => (
                                                        <SelectItem key={publisher.id} value={String(publisher.id)}>
                                                            {optionLabel(publisher)}
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
                                    name="cover_image"
                                    render={({ field: { onChange, value } }) => (
                                        <FormItem>
                                            <FormLabel>Cover image</FormLabel>
                                            <FormControl>
                                                <div className="grid gap-3">
                                                    {typeof value === 'string' && value ? <img src={value} alt="Podcast cover" className="h-28 w-44 rounded-md object-cover shadow-sm" /> : null}
                                                    <Input type="file" accept="image/*" onChange={(event) => onChange(event.target.files?.[0] ?? undefined)} />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem className="lg:col-span-2">
                                            <FormLabel>Description</FormLabel>
                                            <FormControl>
                                                <Textarea className="min-h-28 resize-y" placeholder="Please enter podcast description" {...field} value={field.value ?? ''} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="author_ids"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Authors</FormLabel>
                                            <FormControl>
                                                <MultipleSelect
                                                    placeholder="Select authors..."
                                                    searchPlaceholder="Search authors..."
                                                    options={authorOptions}
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="category_ids"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Categories</FormLabel>
                                            <FormControl>
                                                <MultipleSelect
                                                    placeholder="Select categories..."
                                                    searchPlaceholder="Search categories..."
                                                    options={categoryOptions}
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="content"
                                    render={({ field }) => (
                                        <FormItem className="lg:col-span-3">
                                            <FormLabel>Content</FormLabel>
                                            <FormControl>
                                                <TinyMceEditor value={field.value ?? ''} onChange={field.onChange} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>
                    </form>
                </Form>
            </div>
        </AppLayout>
    );
}
