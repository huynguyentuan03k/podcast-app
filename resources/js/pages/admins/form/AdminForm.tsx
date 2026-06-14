import { MultipleSelect, type MultipleSelectOption } from '@/components/custom/multiple-select';
import { SpinnerLoading } from '@/components/custom/SpinnerLoading';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/components/ui/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import http from '@/http/client';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@/lib/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { ArrowLeft, LoaderCircle, Save } from 'lucide-react';
import { useMemo } from 'react';
import { useForm, type Resolver } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { AdminFormSchema, adminConfig, type Admin, type AdminForm, type RoleOption } from '../shema';

type LaravelValidationError = {
    message?: string;
    errors?: Record<string, string[]>;
};

type AdminFormProps = {
    mode: 'create' | 'edit';
    admin?: Admin;
    isLoading?: boolean;
};

function applyLaravelErrors(form: ReturnType<typeof useForm<AdminForm>>, error: AxiosError<LaravelValidationError>) {
    Object.entries(error.response?.data?.errors ?? {}).forEach(([field, messages]) => {
        form.setError(field as keyof AdminForm, { type: 'server', message: messages[0] ?? 'Invalid value.' });
    });
}

export default function AdminFormPage({ mode, admin, isLoading }: AdminFormProps) {
    const navigate = useNavigate();
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const title = mode === 'create' ? 'Create Admin' : 'Edit Admin';

    const { data: roles = [] } = useQuery({
        queryKey: ['admin-roles', 'options'],
        queryFn: async () => {
            const response = await http.get<{ data: RoleOption[] }>('/frieren-core/roles', { params: { per_page: 100 } });

            return response.data.data ?? [];
        },
    });

    const roleOptions = useMemo<MultipleSelectOption[]>(
        () => roles.map((role) => ({ value: role.id, label: role.display_name || role.name })),
        [roles],
    );

    const selectedRoleIds = useMemo(() => {
        const names = new Set(admin?.roles ?? []);

        return roles.filter((role) => names.has(role.name)).map((role) => role.id);
    }, [admin?.roles, roles]);

    const defaultValues = useMemo<AdminForm>(
        () => ({
            username: admin?.username ?? '',
            email: admin?.email ?? '',
            status: admin?.status ?? 'active',
            password: '',
            password_confirmation: '',
            role_ids: selectedRoleIds,
        }),
        [admin, selectedRoleIds],
    );

    const form = useForm<AdminForm>({
        resolver: zodResolver(AdminFormSchema) as Resolver<AdminForm>,
        values: defaultValues,
    });

    const mutation = useMutation({
        mutationFn: async (values: AdminForm) => {
            const payload = {
                username: values.username,
                email: values.email,
                status: values.status,
                ...(values.password ? { password: values.password, password_confirmation: values.password_confirmation } : {}),
            };

            const response =
                mode === 'create'
                    ? await http.post<{ data: Admin }>(adminConfig.apiPath, payload)
                    : await http.put<{ data: Admin }>(`${adminConfig.apiPath}/${admin?.id}`, payload);

            const adminId = response.data.data.id;
            await http.post(`${adminConfig.apiPath}/${adminId}/roles`, { role_ids: values.role_ids });

            return response;
        },
        onSuccess: async () => {
            toast({
                title: mode === 'create' ? 'create admin successfully' : 'update admin successfully',
                description: mode === 'create' ? 'admin has been stored.' : 'admin has been updated.',
            });
            await queryClient.invalidateQueries({ queryKey: ['admins'] });
            navigate(adminConfig.basePath);
        },
        onError: (error: AxiosError<LaravelValidationError>) => {
            toast({
                title: mode === 'create' ? 'create admin failed' : 'update admin failed',
                description: error.response?.data?.message || 'Something went wrong',
                variant: 'destructive',
            });
            applyLaravelErrors(form, error);
        },
    });

    if (isLoading) return <SpinnerLoading />;

    const submitForm = (values: AdminForm) => {
        if (mode === 'create' && !values.password?.trim()) {
            form.setError('password', { type: 'required', message: 'Password is required.' });
            return;
        }

        if (mode === 'create' && !values.password_confirmation?.trim()) {
            form.setError('password_confirmation', { type: 'required', message: 'Password confirmation is required.' });
            return;
        }

        mutation.mutate(values);
    };

    return (
        <AppLayout breadcrumbs={[...adminConfig.breadcrumbs, ...(admin ? [{ title: `ID: ${admin.id}`, href: `${adminConfig.basePath}/${admin.id}/show` }] : []), { title, href: '#' }]}>
            <Head title={title} />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-auto p-4 md:p-6">
                <div className="flex items-start justify-between gap-4">
                    <h1 className="text-2xl font-semibold">{mode === 'create' ? 'Admins Create' : 'Admins Edit'}</h1>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" className="gap-2 shadow-sm" onClick={() => navigate(-1)}>
                            <ArrowLeft className="size-4" />
                            Cancel
                        </Button>
                        <Button form="admin-form" type="submit" disabled={mutation.isPending} className="gap-2 bg-blue-600 text-white shadow-sm hover:bg-blue-700 focus-visible:ring-blue-500">
                            {mutation.isPending ? <LoaderCircle className="size-4 animate-spin" /> : <Save className="size-4" />}
                            Save
                        </Button>
                    </div>
                </div>

                <Form {...form}>
                    <form id="admin-form" onSubmit={form.handleSubmit(submitForm)}>
                        <div className="rounded-lg border bg-card p-6 shadow-sm">
                            <div className="grid grid-cols-1 gap-x-8 gap-y-6 lg:grid-cols-3">
                                <FormField
                                    control={form.control}
                                    name="username"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Username <span className="text-destructive">*</span>
                                            </FormLabel>
                                            <FormControl>
                                                <Input placeholder="admin username" {...field} />
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
                                                <Input type="email" placeholder="admin@example.com" {...field} />
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
                                            <Select value={field.value} onValueChange={field.onChange}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="active">Active</SelectItem>
                                                    <SelectItem value="suspended">Suspended</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Password {mode === 'create' ? <span className="text-destructive">*</span> : null}
                                            </FormLabel>
                                            <FormControl>
                                                <Input type="password" placeholder={mode === 'create' ? 'Minimum 8 characters' : 'Leave blank to keep current password'} {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="password_confirmation"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Confirm Password {mode === 'create' ? <span className="text-destructive">*</span> : null}
                                            </FormLabel>
                                            <FormControl>
                                                <Input type="password" placeholder="Confirm password" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="role_ids"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Admin Roles</FormLabel>
                                            <FormControl>
                                                <MultipleSelect options={roleOptions} value={field.value} onChange={field.onChange} placeholder="Select admin roles" searchPlaceholder="Search roles" />
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
