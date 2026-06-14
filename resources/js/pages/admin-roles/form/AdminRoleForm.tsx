import { SpinnerLoading } from '@/components/custom/SpinnerLoading';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/components/ui/hooks/use-toast';
import { Input } from '@/components/ui/input';
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
import { AdminRoleFormSchema, adminRoleConfig, type AdminRole, type AdminRoleForm, type PermissionOption } from '../shema';

type LaravelValidationError = {
    message?: string;
    errors?: Record<string, string[]>;
};

type AdminRoleFormProps = {
    mode: 'create' | 'edit';
    role?: AdminRole;
    isLoading?: boolean;
};

function applyLaravelErrors(form: ReturnType<typeof useForm<AdminRoleForm>>, error: AxiosError<LaravelValidationError>) {
    Object.entries(error.response?.data?.errors ?? {}).forEach(([field, messages]) => {
        form.setError(field as keyof AdminRoleForm, { type: 'server', message: messages[0] ?? 'Invalid value.' });
    });
}

function slugify(value: string) {
    return value
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

function formatGroupName(value: string | null) {
    if (!value) return 'Other';

    return value
        .replace(/[_-]+/g, ' ')
        .replace(/\b\w/g, (character) => character.toUpperCase());
}

function formatPermissionName(permission: PermissionOption) {
    return permission.display_name || permission.name.replace(/[._-]+/g, ' ').replace(/\b\w/g, (character) => character.toUpperCase());
}

export default function AdminRoleFormPage({ mode, role, isLoading }: AdminRoleFormProps) {
    const navigate = useNavigate();
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const title = mode === 'create' ? 'Create Admin Role' : 'Edit Admin Role';

    const { data: permissions = [] } = useQuery({
        queryKey: ['permissions', 'options'],
        queryFn: async () => {
            const response = await http.get<{ data: PermissionOption[] }>('/frieren-core/permissions', { params: { per_page: 200 } });

            return response.data.data ?? [];
        },
    });

    const permissionGroups = useMemo(
        () =>
            Object.entries(
                permissions.reduce<Record<string, PermissionOption[]>>((groups, permission) => {
                    const key = permission.group_name || 'other';
                    groups[key] = [...(groups[key] ?? []), permission];

                    return groups;
                }, {}),
            ).sort(([left], [right]) => left.localeCompare(right)),
        [permissions],
    );

    const selectedPermissionIds = useMemo(() => {
        const names = new Set(role?.permissions ?? []);

        return permissions.filter((permission) => names.has(permission.name)).map((permission) => permission.id);
    }, [permissions, role?.permissions]);

    const defaultValues = useMemo<AdminRoleForm>(
        () => ({
            name: role?.name ?? '',
            display_name: role?.display_name ?? '',
            description: role?.description ?? '',
            permission_ids: selectedPermissionIds,
        }),
        [role, selectedPermissionIds],
    );

    const form = useForm<AdminRoleForm>({
        resolver: zodResolver(AdminRoleFormSchema) as Resolver<AdminRoleForm>,
        values: defaultValues,
    });

    const mutation = useMutation({
        mutationFn: async (values: AdminRoleForm) => {
            const roleName = values.name?.trim() || slugify(values.display_name);
            const payload = {
                name: roleName,
                display_name: values.display_name,
                description: values.description ?? '',
            };

            const response =
                mode === 'create'
                    ? await http.post<{ data: AdminRole }>(adminRoleConfig.apiPath, payload)
                    : await http.put<{ data: AdminRole }>(`${adminRoleConfig.apiPath}/${role?.id}`, payload);

            const roleId = response.data.data.id;
            await http.post(`${adminRoleConfig.apiPath}/${roleId}/permissions`, { permission_ids: values.permission_ids });

            return response;
        },
        onSuccess: async () => {
            toast({
                title: mode === 'create' ? 'create admin role successfully' : 'update admin role successfully',
                description: mode === 'create' ? 'admin role has been stored.' : 'admin role has been updated.',
            });
            await queryClient.invalidateQueries({ queryKey: ['admin-roles'] });
            navigate(adminRoleConfig.basePath);
        },
        onError: (error: AxiosError<LaravelValidationError>) => {
            toast({
                title: mode === 'create' ? 'create admin role failed' : 'update admin role failed',
                description: error.response?.data?.message || 'Something went wrong',
                variant: 'destructive',
            });
            applyLaravelErrors(form, error);
        },
    });

    if (isLoading) return <SpinnerLoading />;

    return (
        <AppLayout breadcrumbs={[...adminRoleConfig.breadcrumbs, ...(role ? [{ title: `ID: ${role.id}`, href: `${adminRoleConfig.basePath}/${role.id}/show` }] : []), { title, href: '#' }]}>
            <Head title={title} />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-auto p-4 md:p-6">
                <div className="flex items-start justify-between gap-4">
                    <h1 className="text-2xl font-semibold">{mode === 'create' ? 'Admin Roles Create' : 'Admin Roles Edit'}</h1>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" className="gap-2 shadow-sm" onClick={() => navigate(-1)}>
                            <ArrowLeft className="size-4" />
                            Cancel
                        </Button>
                        <Button form="admin-role-form" type="submit" disabled={mutation.isPending} className="gap-2 bg-blue-600 text-white shadow-sm hover:bg-blue-700 focus-visible:ring-blue-500">
                            {mutation.isPending ? <LoaderCircle className="size-4 animate-spin" /> : <Save className="size-4" />}
                            Save
                        </Button>
                    </div>
                </div>

                <Form {...form}>
                    <form id="admin-role-form" onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
                        <div className="rounded-lg border bg-card p-6 shadow-sm">
                            <div className="space-y-8">
                                <FormField
                                    control={form.control}
                                    name="display_name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Role Name <span className="text-destructive">*</span>
                                            </FormLabel>
                                            <FormControl>
                                                <Input placeholder="Role Name" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="permission_ids"
                                    render={({ field }) => (
                                        <FormItem className="space-y-6">
                                            <FormLabel className="text-base font-semibold">Permissions</FormLabel>
                                            <FormControl>
                                                <div className="grid grid-cols-1 gap-x-16 gap-y-10 md:grid-cols-2 xl:grid-cols-3">
                                                    {permissionGroups.map(([groupName, groupPermissions]) => {
                                                        const groupPermissionIds = groupPermissions.map((permission) => permission.id);
                                                        const selectedCount = groupPermissionIds.filter((permissionId) => field.value.includes(permissionId)).length;
                                                        const checked = selectedCount === groupPermissionIds.length;
                                                        const indeterminate = selectedCount > 0 && selectedCount < groupPermissionIds.length;

                                                        const toggleGroup = () => {
                                                            if (checked) {
                                                                field.onChange(field.value.filter((permissionId) => !groupPermissionIds.includes(permissionId)));
                                                                return;
                                                            }

                                                            field.onChange(Array.from(new Set([...field.value, ...groupPermissionIds])));
                                                        };

                                                        return (
                                                            <div key={groupName} className="space-y-3">
                                                                <label className="flex cursor-pointer items-center gap-3">
                                                                    <Checkbox checked={indeterminate ? 'indeterminate' : checked} onCheckedChange={toggleGroup} />
                                                                    <span className="text-base font-semibold">{formatGroupName(groupName)}</span>
                                                                </label>
                                                                <div className="ml-6 space-y-3">
                                                                    {groupPermissions.map((permission) => {
                                                                        const permissionChecked = field.value.includes(permission.id);

                                                                        return (
                                                                            <label key={permission.id} className="flex cursor-pointer items-center gap-3 text-sm">
                                                                                <Checkbox
                                                                                    checked={permissionChecked}
                                                                                    onCheckedChange={() =>
                                                                                        field.onChange(
                                                                                            permissionChecked
                                                                                                ? field.value.filter((permissionId) => permissionId !== permission.id)
                                                                                                : [...field.value, permission.id],
                                                                                        )
                                                                                    }
                                                                                />
                                                                                <span>{formatPermissionName(permission)}</span>
                                                                            </label>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
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
