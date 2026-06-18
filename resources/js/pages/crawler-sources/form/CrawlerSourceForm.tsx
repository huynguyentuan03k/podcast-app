import { SpinnerLoading } from '@/components/custom/SpinnerLoading';
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
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { ArrowLeft, LoaderCircle, Save } from 'lucide-react';
import { useMemo } from 'react';
import { useForm, type Resolver } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { CrawlerSourceFormSchema, crawlerSourceConfig, type CrawlerSource, type CrawlerSourceForm as CrawlerSourceFormValues } from '../shema';

type LaravelValidationError = {
    message?: string;
    errors?: Record<string, string[]>;
};

type CrawlerSourceFormProps = {
    mode: 'create' | 'edit';
    source?: CrawlerSource;
    isLoading?: boolean;
};

function applyLaravelErrors(form: ReturnType<typeof useForm<CrawlerSourceFormValues>>, error: AxiosError<LaravelValidationError>) {
    Object.entries(error.response?.data?.errors ?? {}).forEach(([field, messages]) => {
        form.setError(field as keyof CrawlerSourceFormValues, {
            type: 'server',
            message: messages[0] ?? 'Invalid value.',
        });
    });
}

function buildCrawlerSourcePayload(values: CrawlerSourceFormValues) {
    return {
        crawler_profile_id: values.crawler_profile_id || null,
        name: values.name,
        type: values.type,
        base_url: values.base_url,
        status: values.status,
        options_override: values.options_override?.trim() ? JSON.parse(values.options_override) : null,
        start_urls: values.start_urls?.trim() ? values.start_urls.split('\n').map((item) => item.trim()).filter(Boolean) : null,
    };
}

export default function CrawlerSourceForm({ mode, source, isLoading }: CrawlerSourceFormProps) {
    const navigate = useNavigate();
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const title = mode === 'create' ? 'Create Crawler Source' : 'Edit Crawler Source';

    const defaultValues = useMemo<CrawlerSourceFormValues>(
        () => ({
            crawler_profile_id: source?.crawler_profile_id ?? null,
            name: source?.name ?? '',
            type: source?.type ?? 'website',
            base_url: source?.base_url ?? '',
            status: source?.status === 'paused' ? 'paused' : 'active',
            options_override: source?.options_override ? JSON.stringify(source.options_override, null, 2) : '',
            start_urls: source?.start_urls?.length ? source.start_urls.join('\n') : '',
        }),
        [source],
    );

    const form = useForm<CrawlerSourceFormValues>({
        resolver: zodResolver(CrawlerSourceFormSchema) as Resolver<CrawlerSourceFormValues>,
        values: defaultValues,
    });

    const mutation = useMutation({
        mutationFn: async (values: CrawlerSourceFormValues) => {
            const payload = buildCrawlerSourcePayload(values);
            const endpoint = crawlerSourceConfig.endpoint.replace('/api/', '/');

            return mode === 'create'
                ? http.post<CrawlerSource>(endpoint, payload)
                : http.put<CrawlerSource>(`${endpoint}/${source?.id}`, payload);
        },
        onSuccess: async () => {
            toast({
                title: mode === 'create' ? 'create crawler source successfully' : 'update crawler source successfully',
                description: mode === 'create' ? 'crawler source has been store.' : 'crawler source has been updated.',
            });
            await queryClient.invalidateQueries({ queryKey: ['crawler-sources'] });
            navigate(crawlerSourceConfig.basePath);
        },
        onError: (error: AxiosError<LaravelValidationError>) => {
            toast({
                title: mode === 'create' ? 'create crawler source failed' : 'update crawler source failed',
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
        <AppLayout breadcrumbs={[...crawlerSourceConfig.breadcrumbs, ...(source ? [{ title: `ID: ${source.id}`, href: `${crawlerSourceConfig.basePath}/${source.id}/show` }] : []), { title, href: '#' }]}>
            <Head title={title} />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-auto p-4 md:p-6">
                <div className="flex items-start justify-between gap-4">
                    <h1 className="text-2xl font-semibold">{mode === 'create' ? 'Crawler Sources Create' : 'Crawler Sources Edit'}</h1>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" className="gap-2 shadow-sm" onClick={() => navigate(-1)}>
                            <ArrowLeft className="size-4" />
                            Cancel
                        </Button>
                        <Button
                            form="crawler-source-form"
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
                    <form id="crawler-source-form" onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
                        <div className="rounded-lg border bg-card p-6 shadow-sm">
                            <div className="grid grid-cols-1 gap-x-8 gap-y-6 lg:grid-cols-3">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Name <span className="text-destructive">*</span>
                                            </FormLabel>
                                            <FormControl>
                                                <Input placeholder="Please enter source name" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="type"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Type <span className="text-destructive">*</span>
                                            </FormLabel>
                                            <FormControl>
                                                <Input placeholder="website" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="status"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Status <span className="text-destructive">*</span>
                                            </FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select status" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="active">Active</SelectItem>
                                                    <SelectItem value="paused">Paused</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="base_url"
                                    render={({ field }) => (
                                        <FormItem className="lg:col-span-2">
                                            <FormLabel>
                                                Base URL <span className="text-destructive">*</span>
                                            </FormLabel>
                                            <FormControl>
                                                <Input placeholder="https://example.com" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="crawler_profile_id"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Profile ID</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    placeholder="Optional"
                                                    value={field.value ?? ''}
                                                    onChange={(event) => field.onChange(event.target.value)}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="start_urls"
                                    render={({ field }) => (
                                        <FormItem className="lg:col-span-3">
                                            <FormLabel>Start URLs</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    className="min-h-28 resize-y font-mono"
                                                    placeholder={'https://example.com/page-1\nhttps://example.com/page-2'}
                                                    {...field}
                                                    value={field.value ?? ''}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="options_override"
                                    render={({ field }) => (
                                        <FormItem className="lg:col-span-3">
                                            <FormLabel>Options Override JSON</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    className="min-h-48 resize-y font-mono"
                                                    placeholder={'{\n  "headers": {\n    "User-Agent": "Crawler"\n  }\n}'}
                                                    {...field}
                                                    value={field.value ?? ''}
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
            </div>
        </AppLayout>
    );
}
