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
import { useForm, type Resolver } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { authorConfig, AuthorFormSchema, type Author, type AuthorForm } from '../shema';

type LaravelValidationError = {
    message?: string;
    errors?: Record<string, string[]>;
};

type AuthorFormProps = {
    mode: 'create' | 'edit';
    author?: Author;
    isLoading?: boolean;
};

function buildAuthorPayload(values: AuthorForm) {
    const formData = new FormData();

    formData.append('name', values.name);
    formData.append('bio', values.bio ?? '');
    formData.append('email', values.email ?? '');
    formData.append('website', values.website ?? '');

    if (values.avatar instanceof File) {
        formData.append('avatar', values.avatar);
    }

    return formData;
}

function applyLaravelErrors(form: ReturnType<typeof useForm<AuthorForm>>, error: AxiosError<LaravelValidationError>) {
    Object.entries(error.response?.data?.errors ?? {}).forEach(([field, messages]) => {
        form.setError(field as keyof AuthorForm, {
            type: 'server',
            message: messages[0] ?? 'Invalid value.',
        });
    });
}

export default function AuthorForm({ mode, author, isLoading }: AuthorFormProps) {
    const navigate = useNavigate();
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const title = mode === 'create' ? 'Create Author' : 'Edit Author';

    const defaultValues = useMemo<AuthorForm>(
        () => ({
            name: author?.name ?? '',
            bio: author?.bio ?? '',
            email: author?.email ?? '',
            website: author?.website ?? '',
            avatar: author?.avatar_url ?? undefined,
        }),
        [author],
    );

    const form = useForm<AuthorForm>({
        resolver: zodResolver(AuthorFormSchema) as Resolver<AuthorForm>,
        values: defaultValues,
    });

    const mutation = useMutation({
        mutationFn: async (values: AuthorForm) => {
            const payload = buildAuthorPayload(values);
            const endpoint = authorConfig.endpoint.replace('/api/', '/');

            return mode === 'create'
                ? http.post<Author>(endpoint, payload, { headers: { 'Content-Type': 'multipart/form-data' } })
                : http.post<Author>(`${endpoint}/${author?.id}`, payload, { headers: { 'Content-Type': 'multipart/form-data' } });
        },
        onSuccess: async () => {
            toast({
                title: mode === 'create' ? 'create author successfully' : 'update author successfully',
                description: mode === 'create' ? 'author has been store.' : 'author has been updated.',
            });
            await queryClient.invalidateQueries({ queryKey: ['authors'] });
            navigate(authorConfig.basePath);
        },
        onError: (error: AxiosError<LaravelValidationError>) => {
            toast({
                title: mode === 'create' ? 'create author failed' : 'update author failed',
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
        <AppLayout breadcrumbs={[...authorConfig.breadcrumbs, ...(author ? [{ title: `ID: ${author.id}`, href: `${authorConfig.basePath}/${author.id}/show` }] : []), { title, href: '#' }]}>
            <Head title={title} />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-auto p-4 md:p-6">
                <div className="flex items-start justify-between gap-4">
                    <h1 className="text-2xl font-semibold">{mode === 'create' ? 'Authors Create' : 'Authors Edit'}</h1>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" className="gap-2 shadow-sm" onClick={() => navigate(-1)}>
                            <ArrowLeft className="size-4" />
                            Cancel
                        </Button>
                        <Button
                            form="author-form"
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
                    <form id="author-form" onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
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
                                                <Input placeholder="Please enter a name" {...field} />
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
                                            <FormLabel>Email</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Please enter an email" {...field} />
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
                                                <Input placeholder="Please enter a website" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="avatar"
                                    render={({ field: { onChange, value } }) => (
                                        <FormItem>
                                            <FormLabel>Avatar</FormLabel>
                                            <FormControl>
                                                <div className="grid gap-3">
                                                    {typeof value === 'string' && value ? <img src={value} alt="Author avatar" className="size-20 rounded-full object-cover shadow-sm" /> : null}
                                                    <Input type="file" accept="image/*" onChange={(event) => onChange(event.target.files?.[0] ?? undefined)} />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="bio"
                                    render={({ field }) => (
                                        <FormItem className="lg:col-span-3">
                                            <FormLabel>Bio</FormLabel>
                                            <FormControl>
                                                <Textarea className="min-h-[360px] resize-y" placeholder="Please enter author bio" {...field} />
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
