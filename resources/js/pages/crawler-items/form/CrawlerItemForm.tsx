import { MultipleSelect, type MultipleSelectOption } from '@/components/custom/multiple-select';
import { SpinnerLoading } from '@/components/custom/SpinnerLoading';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
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
import { useMemo } from 'react';
import { useForm, type Resolver } from 'react-hook-form';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { crawlerItemConfig, CrawlerItemFormSchema, type CrawlerItem, type CrawlerItemForm as CrawlerItemFormValues } from '../shema';

type LaravelValidationError = {
    message?: string;
    errors?: Record<string, string[]>;
};

type CrawlerSourceOption = {
    id: number;
    name: string | null;
    type: string | null;
    base_url?: string | null;
    url?: string | null;
};

type PodcastOption = {
    id: number;
    title: string | null;
};

type CrawlerItemFormProps = {
    mode: 'create' | 'edit';
    item?: CrawlerItem;
    isLoading?: boolean;
};

function parseMetadata(value: string | null) {
    if (!value?.trim()) return null;

    return JSON.parse(value);
}

function applyLaravelErrors(form: ReturnType<typeof useForm<CrawlerItemFormValues>>, error: AxiosError<LaravelValidationError>) {
    Object.entries(error.response?.data?.errors ?? {}).forEach(([field, messages]) => {
        form.setError(field as keyof CrawlerItemFormValues, {
            type: 'server',
            message: messages[0] ?? 'Invalid value.',
        });
    });
}

export default function CrawlerItemForm({ mode, item, isLoading }: CrawlerItemFormProps) {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const title = mode === 'create' ? 'Create Crawler Item' : 'Edit Crawler Item';
    const sourceIdFromQuery = Number(searchParams.get('source_id') ?? 0);

    const sources = useQuery({
        queryKey: ['crawler-sources', 'options'],
        queryFn: async () => {
            const response = await http.get<{ data: CrawlerSourceOption[] }>('/frieren-crawler/admin/sources', { params: { per_page: 200 } });

            return response.data.data;
        },
    });

    const podcasts = useQuery({
        queryKey: ['podcasts', 'options'],
        queryFn: async () => {
            const response = await http.get<{ data: PodcastOption[] }>('/podcasts', { params: { per_page: 200 } });

            return response.data.data ?? [];
        },
    });

    const defaultValues = useMemo<CrawlerItemFormValues>(
        () => ({
            crawler_source_id: item?.source?.id ?? sourceIdFromQuery ?? 0,
            podcast_id: item?.podcast?.id ?? null,
            item_type: item?.item_type ?? 'podcast',
            external_id: item?.external_id ?? '',
            title: item?.title ?? '',
            slug: item?.slug ?? '',
            source_url: item?.source_url ?? '',
            canonical_url: item?.canonical_url ?? '',
            description: item?.description ?? '',
            thumbnail_url: item?.thumbnail_url ?? '',
            status: item?.status ?? 'pending',
            metadata: item?.metadata ? JSON.stringify(item.metadata, null, 2) : '',
            error_message: item?.error_message ?? '',
        }),
        [item, sourceIdFromQuery],
    );

    const podcastOptions = useMemo<MultipleSelectOption[]>(
        () => (podcasts.data ?? []).map((podcast) => ({ value: podcast.id, label: podcast.title ?? `Podcast #${podcast.id}` })),
        [podcasts.data],
    );

    const form = useForm<CrawlerItemFormValues>({
        resolver: zodResolver(CrawlerItemFormSchema) as Resolver<CrawlerItemFormValues>,
        values: defaultValues,
    });

    const mutation = useMutation({
        mutationFn: async (values: CrawlerItemFormValues) => {
            const payload = {
                ...values,
                podcast_id: values.podcast_id || null,
                canonical_url: values.canonical_url || null,
                thumbnail_url: values.thumbnail_url || null,
                metadata: parseMetadata(values.metadata),
            };

            return mode === 'create'
                ? http.post('/frieren-crawler/admin/items', payload)
                : http.put(`/frieren-crawler/admin/items/${item?.id}`, payload);
        },
        onSuccess: async () => {
            toast({
                title: mode === 'create' ? 'create crawler item successfully' : 'update crawler item successfully',
                description: mode === 'create' ? 'crawler item has been stored.' : 'crawler item has been updated.',
            });
            await queryClient.invalidateQueries({ queryKey: ['crawler-items'] });
            navigate(crawlerItemConfig.basePath);
        },
        onError: (error: AxiosError<LaravelValidationError>) => {
            toast({
                title: mode === 'create' ? 'create crawler item failed' : 'update crawler item failed',
                description: error.response?.data?.message || error.message || 'Something went wrong',
                variant: 'destructive',
            });
            applyLaravelErrors(form, error);
        },
    });

    if (isLoading || sources.isLoading || podcasts.isLoading) {
        return <SpinnerLoading />;
    }

    return (
        <AppLayout breadcrumbs={[...crawlerItemConfig.breadcrumbs, ...(item ? [{ title: `ID: ${item.id}`, href: `${crawlerItemConfig.basePath}/${item.id}/show` }] : []), { title, href: '#' }]}>
            <Head title={title} />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-auto p-4 md:p-6">
                <div className="flex items-start justify-between gap-4">
                    <h1 className="text-2xl font-semibold">{mode === 'create' ? 'Crawler Items Create' : 'Crawler Items Edit'}</h1>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" className="gap-2 shadow-sm" onClick={() => navigate(-1)}>
                            <ArrowLeft className="size-4" />
                            Cancel
                        </Button>
                        <Button form="crawler-item-form" type="submit" disabled={mutation.isPending} className="gap-2 bg-blue-600 text-white shadow-sm hover:bg-blue-700 focus-visible:ring-blue-500">
                            {mutation.isPending ? <LoaderCircle className="size-4 animate-spin" /> : <Save className="size-4" />}
                            Save
                        </Button>
                    </div>
                </div>

                <Form {...form}>
                    <form id="crawler-item-form" onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
                        <div className="rounded-lg border bg-card p-6 shadow-sm">
                            <div className="grid grid-cols-1 gap-x-8 gap-y-6 lg:grid-cols-3">
                                <FormField
                                    control={form.control}
                                    name="crawler_source_id"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Crawler Source <span className="text-destructive">*</span>
                                            </FormLabel>
                                            <Select value={String(field.value || '')} onValueChange={(value) => field.onChange(Number(value))}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select source" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {(sources.data ?? []).map((source) => (
                                                        <SelectItem key={source.id} value={String(source.id)}>
                                                            {source.name ?? `Source #${source.id}`}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormDescription>Each crawler item belongs to one crawler source.</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField control={form.control} name="title" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Title</FormLabel>
                                        <FormControl><Input placeholder="Podcast title" {...field} value={field.value ?? ''} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />

                                <FormField control={form.control} name="status" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Status <span className="text-destructive">*</span>
                                        </FormLabel>
                                        <Select value={field.value} onValueChange={field.onChange}>
                                            <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                            <SelectContent>
                                                <SelectItem value="discovered">Discovered</SelectItem>
                                                <SelectItem value="pending">Pending</SelectItem>
                                                <SelectItem value="processing">Processing</SelectItem>
                                                <SelectItem value="ready">Ready</SelectItem>
                                                <SelectItem value="imported">Imported</SelectItem>
                                                <SelectItem value="duplicate">Duplicate</SelectItem>
                                                <SelectItem value="skipped">Skipped</SelectItem>
                                                <SelectItem value="failed">Failed</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )} />

                                <FormField control={form.control} name="item_type" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Item Type <span className="text-destructive">*</span>
                                        </FormLabel>
                                        <Select value={field.value} onValueChange={field.onChange}>
                                            <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                            <SelectContent>
                                                <SelectItem value="podcast">Podcast</SelectItem>
                                                <SelectItem value="article">Article</SelectItem>
                                                <SelectItem value="video">Video</SelectItem>
                                                <SelectItem value="book">Book</SelectItem>
                                                <SelectItem value="document">Document</SelectItem>
                                                <SelectItem value="product">Product</SelectItem>
                                                <SelectItem value="course">Course</SelectItem>
                                                <SelectItem value="gallery">Gallery</SelectItem>
                                                <SelectItem value="unknown">Unknown</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormDescription>This describes the page-level content. Audio/video/image files belong to assets under the item.</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )} />

                                <FormField control={form.control} name="source_url" render={({ field }) => (
                                    <FormItem className="lg:col-span-3">
                                        <FormLabel>
                                            Source URL <span className="text-destructive">*</span>
                                        </FormLabel>
                                        <FormControl><Input placeholder="https://example.com/podcast-page.html" {...field} /></FormControl>
                                        <FormDescription>One crawler item represents one page URL. If a page contains many episodes or audios, keep one item and manage them in Item Audios.</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )} />

                                <FormField control={form.control} name="canonical_url" render={({ field }) => (
                                    <FormItem className="lg:col-span-2">
                                        <FormLabel>Canonical URL</FormLabel>
                                        <FormControl><Input placeholder="https://example.com/canonical-page.html" {...field} value={field.value ?? ''} /></FormControl>
                                        <FormDescription>Optional. Only use this when the site exposes another canonical page URL for the same item.</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )} />

                                <FormField control={form.control} name="thumbnail_url" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Thumbnail URL</FormLabel>
                                        <FormControl><Input placeholder="https://example.com/image.jpg" {...field} value={field.value ?? ''} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />

                                <FormField control={form.control} name="external_id" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>External ID</FormLabel>
                                        <FormControl><Input placeholder="External ID" {...field} value={field.value ?? ''} /></FormControl>
                                        <FormDescription>Optional. Use a stable page-level ID only if the source website provides one. Do not use episode numbers from the same page here.</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )} />

                                <FormField control={form.control} name="slug" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Slug</FormLabel>
                                        <FormControl><Input placeholder="crawler-item-slug" {...field} value={field.value ?? ''} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />

                                <FormField control={form.control} name="podcast_id" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Podcast</FormLabel>
                                        <FormControl>
                                            <MultipleSelect
                                                selectionMode="single"
                                                options={podcastOptions}
                                                value={field.value ?? null}
                                                onChange={field.onChange}
                                                placeholder="Select podcast..."
                                                searchPlaceholder="Search podcasts..."
                                            />
                                        </FormControl>
                                        <FormDescription>Optional. Link this crawler page to one podcast in the system.</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )} />

                                <FormField control={form.control} name="description" render={({ field }) => (
                                    <FormItem className="lg:col-span-3">
                                        <FormLabel>Description</FormLabel>
                                        <FormControl><Textarea className="min-h-[180px]" placeholder="Crawler item description" {...field} value={field.value ?? ''} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />

                                <FormField control={form.control} name="metadata" render={({ field }) => (
                                    <FormItem className="lg:col-span-2">
                                        <FormLabel>Metadata JSON</FormLabel>
                                        <FormControl><Textarea className="min-h-[220px] font-mono text-sm" placeholder='{"authors": [], "warnings": []}' {...field} value={field.value ?? ''} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />

                                <FormField control={form.control} name="error_message" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Error Message</FormLabel>
                                        <FormControl><Textarea className="min-h-[220px]" placeholder="Optional error message" {...field} value={field.value ?? ''} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            </div>
                        </div>
                    </form>
                </Form>
            </div>
        </AppLayout>
    );
}
