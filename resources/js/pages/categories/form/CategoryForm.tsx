import { SpinnerLoading } from '@/components/custom/SpinnerLoading';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/components/ui/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
import { categoryConfig, CategoryFormSchema, type Category, type CategoryForm as CategoryFormValues } from '../shema';

type LaravelValidationError = {
    message?: string;
    errors?: Record<string, string[]>;
};

type CategoryFormProps = {
    mode: 'create' | 'edit';
    category?: Category;
    isLoading?: boolean;
};

function applyLaravelErrors(form: ReturnType<typeof useForm<CategoryFormValues>>, error: AxiosError<LaravelValidationError>) {
    Object.entries(error.response?.data?.errors ?? {}).forEach(([field, messages]) => {
        form.setError(field as keyof CategoryFormValues, {
            type: 'server',
            message: messages[0] ?? 'Invalid value.',
        });
    });
}

export default function CategoryForm({ mode, category, isLoading }: CategoryFormProps) {
    const navigate = useNavigate();
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const title = mode === 'create' ? 'Create Category' : 'Edit Category';

    const defaultValues = useMemo<CategoryFormValues>(
        () => ({
            name: {
                en: category?.name.en ?? '',
                vi: category?.name.vi ?? '',
            },
            description: category?.description ?? '',
        }),
        [category],
    );

    const form = useForm<CategoryFormValues>({
        resolver: zodResolver(CategoryFormSchema),
        values: defaultValues,
    });

    const mutation = useMutation({
        mutationFn: async (values: CategoryFormValues) => {
            const endpoint = categoryConfig.endpoint.replace('/api/', '/');

            return mode === 'create'
                ? http.post<Category>(endpoint, values)
                : http.put<Category>(`${endpoint}/${category?.id}`, values);
        },
        onSuccess: async () => {
            toast({
                title: mode === 'create' ? 'create category successfully' : 'update category successfully',
                description: mode === 'create' ? 'category has been store.' : 'category has been updated.',
            });
            await queryClient.invalidateQueries({ queryKey: ['categories'] });
            navigate(categoryConfig.basePath);
        },
        onError: (error: AxiosError<LaravelValidationError>) => {
            toast({
                title: mode === 'create' ? 'create category failed' : 'update category failed',
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
        <AppLayout breadcrumbs={[...categoryConfig.breadcrumbs, ...(category ? [{ title: `ID: ${category.id}`, href: `${categoryConfig.basePath}/${category.id}/show` }] : []), { title, href: '#' }]}>
            <Head title={title} />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-auto p-4 md:p-6">
                <div className="flex items-start justify-between gap-4">
                    <h1 className="text-2xl font-semibold">{mode === 'create' ? 'Categories Create' : 'Categories Edit'}</h1>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" className="gap-2 shadow-sm" onClick={() => navigate(-1)}>
                            <ArrowLeft className="size-4" />
                            Cancel
                        </Button>
                        <Button
                            form="category-form"
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
                    <form id="category-form" onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
                        <div className="rounded-lg border bg-card p-6 shadow-sm">
                            <div className="grid grid-cols-1 gap-x-8 gap-y-6 lg:grid-cols-2">
                                <FormField
                                    control={form.control}
                                    name="name.en"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Name EN <span className="text-destructive">*</span>
                                            </FormLabel>
                                            <FormControl>
                                                <Input placeholder="Please enter an English name" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="name.vi"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Name VI <span className="text-destructive">*</span>
                                            </FormLabel>
                                            <FormControl>
                                                <Input placeholder="Please enter a Vietnamese name" {...field} />
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
                                                <Textarea className="min-h-[360px] resize-y" placeholder="Please enter category description" {...field} value={field.value ?? ''} />
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
