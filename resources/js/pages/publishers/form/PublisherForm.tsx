import { SpinnerLoading } from '@/components/custom/SpinnerLoading';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/components/ui/hooks/use-toast';
import { Input } from '@/components/ui/input';
import http from '@/http/client';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@/lib/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { ArrowLeft, LoaderCircle, Save } from 'lucide-react';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { PublisherFormSchema, publisherConfig, type Publisher, type PublisherForm as PublisherFormValues } from '../shema';

type LaravelValidationError = {
    message?: string;
    errors?: Record<string, string[]>;
};

type PublisherFormProps = {
    mode: 'create' | 'edit';
    publisher?: Publisher;
    isLoading?: boolean;
};

function applyLaravelErrors(form: ReturnType<typeof useForm<PublisherFormValues>>, error: AxiosError<LaravelValidationError>) {
    Object.entries(error.response?.data?.errors ?? {}).forEach(([field, messages]) => {
        form.setError(field as keyof PublisherFormValues, {
            type: 'server',
            message: messages[0] ?? 'Invalid value.',
        });
    });
}

export default function PublisherForm({ mode, publisher, isLoading }: PublisherFormProps) {
    const navigate = useNavigate();
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const title = mode === 'create' ? 'Create Publisher' : 'Edit Publisher';

    const defaultValues = useMemo<PublisherFormValues>(
        () => ({
            name: publisher?.name ?? '',
            email: publisher?.email ?? '',
            phone: publisher?.phone ?? '',
            address: publisher?.address ?? '',
            website: publisher?.website ?? '',
            established_year: publisher?.established_year ?? new Date().getFullYear(),
        }),
        [publisher],
    );

    const form = useForm<PublisherFormValues>({
        resolver: zodResolver(PublisherFormSchema),
        values: defaultValues,
    });

    const mutation = useMutation({
        mutationFn: async (values: PublisherFormValues) => {
            const endpoint = publisherConfig.endpoint.replace('/api/', '/');

            return mode === 'create'
                ? http.post<Publisher>(endpoint, values)
                : http.put<Publisher>(`${endpoint}/${publisher?.id}`, values);
        },
        onSuccess: async () => {
            toast({
                title: mode === 'create' ? 'create publisher successfully' : 'update publisher successfully',
                description: mode === 'create' ? 'publisher has been store.' : 'publisher has been updated.',
            });
            await queryClient.invalidateQueries({ queryKey: ['publishers'] });
            navigate(publisherConfig.basePath);
        },
        onError: (error: AxiosError<LaravelValidationError>) => {
            toast({
                title: mode === 'create' ? 'create publisher failed' : 'update publisher failed',
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
        <AppLayout breadcrumbs={[...publisherConfig.breadcrumbs, ...(publisher ? [{ title: `ID: ${publisher.id}`, href: `${publisherConfig.basePath}/${publisher.id}/show` }] : []), { title, href: '#' }]}>
            <Head title={title} />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-auto p-4 md:p-6">
                <div className="flex items-start justify-between gap-4">
                    <h1 className="text-2xl font-semibold">{mode === 'create' ? 'Publishers Create' : 'Publishers Edit'}</h1>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" className="gap-2 shadow-sm" onClick={() => navigate(-1)}>
                            <ArrowLeft className="size-4" />
                            Cancel
                        </Button>
                        <Button
                            form="publisher-form"
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
                    <form id="publisher-form" onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
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
                                                <Input placeholder="Please enter publisher name" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Email <span className="text-destructive">*</span>
                                            </FormLabel>
                                            <FormControl>
                                                <Input placeholder="publisher@example.com" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="phone"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Phone <span className="text-destructive">*</span>
                                            </FormLabel>
                                            <FormControl>
                                                <Input placeholder="Please enter phone" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="website"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Website</FormLabel>
                                            <FormControl>
                                                <Input placeholder="https://example.com" {...field} value={field.value ?? ''} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="established_year"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Established year <span className="text-destructive">*</span>
                                            </FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="2026" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="address"
                                    render={({ field }) => (
                                        <FormItem className="lg:col-span-3">
                                            <FormLabel>Address</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Please enter address" {...field} value={field.value ?? ''} />
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
