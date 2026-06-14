import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/hooks/use-toast';
import http from '@/http/client';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@/lib/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { ArrowLeft, LoaderCircle, Save, ShieldCheck, User } from 'lucide-react';
import { useEffect, useMemo } from 'react';
import { useForm, type Resolver } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { z } from 'zod';

const adminProfileSchema = z.object({
    user_admin_id: z.number().int().positive('Admin account is required.'),
    employee_code: z.string().optional().or(z.literal('')),
    first_name: z.string().min(1, 'First name is required.'),
    last_name: z.string().min(1, 'Last name is required.'),
    phone_number: z.string().optional().or(z.literal('')),
    avatar: z.string().optional().or(z.literal('')),
    department: z.string().optional().or(z.literal('')),
    metadata: z.string().optional().or(z.literal('')),
});

type AdminProfileForm = z.infer<typeof adminProfileSchema>;

type LaravelValidationError = {
    message?: string;
    errors?: Record<string, string[]>;
};

type AdminProfilePayload = Omit<AdminProfileForm, 'metadata'> & {
    metadata: Record<string, unknown> | null;
};

function normalizeJson(value?: unknown) {
    if (!value) return '';

    if (typeof value === 'string') {
        return value;
    }

    return JSON.stringify(value, null, 2);
}

function parseMetadata(value: string) {
    if (!value.trim()) {
        return null;
    }

    return JSON.parse(value) as Record<string, unknown>;
}

export default function AccountPage() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const currentAdmin = window.appSettings?.currentAdmin ?? null;
    const profile = currentAdmin?.profile ?? null;

    const defaultValues = useMemo<AdminProfileForm>(
        () => ({
            user_admin_id: currentAdmin?.id ?? 0,
            employee_code: profile?.employee_code ?? '',
            first_name: profile?.first_name ?? '',
            last_name: profile?.last_name ?? '',
            phone_number: profile?.phone_number ?? '',
            avatar: profile?.avatar ?? '',
            department: profile?.department ?? '',
            metadata: normalizeJson(profile?.metadata),
        }),
        [currentAdmin?.id, profile],
    );

    const form = useForm<AdminProfileForm>({
        resolver: zodResolver(adminProfileSchema) as Resolver<AdminProfileForm>,
        defaultValues,
    });

    useEffect(() => {
        form.reset(defaultValues);
    }, [defaultValues, form]);

    const mutation = useMutation({
        mutationFn: async (values: AdminProfileForm) => {
            const payload: AdminProfilePayload = {
                ...values,
                metadata: values.metadata ? parseMetadata(values.metadata) : null,
            };

            return profile?.id
                ? http.put(`/frieren-core/admin-profiles/${profile.id}`, payload)
                : http.post('/frieren-core/admin-profiles', payload);
        },
        onSuccess: async () => {
            toast({
                title: profile?.id ? 'update profile successfully' : 'create profile successfully',
                description: 'profile has been saved.',
            });
        },
        onError: (error: AxiosError<LaravelValidationError>) => {
            const backendMessage = error.response?.data?.message || 'Something went wrong';

            toast({
                title: profile?.id ? 'update profile failed' : 'create profile failed',
                description: backendMessage,
                variant: 'destructive',
            });
        },
    });

    if (!currentAdmin) {
        return (
            <AppLayout>
                <div className="flex h-full items-center justify-center p-6">
                    <Card className="w-full max-w-md">
                        <CardHeader>
                            <CardTitle>Profile unavailable</CardTitle>
                            <CardDescription>You need to sign in as admin to access this page.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button asChild variant="outline">
                                <Link to="/login">Go to login</Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <Head title="Admin Profile" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-auto p-4 md:p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
                            <ShieldCheck className="size-4" />
                            <span>Frieren Core</span>
                            <span>›</span>
                            <span className="text-foreground">Profile</span>
                        </div>
                        <h1 className="text-2xl font-semibold">Admin Profile</h1>
                        <p className="text-sm text-muted-foreground">Manage the profile attached to your admin account.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" className="gap-2 shadow-sm" onClick={() => navigate(-1)}>
                            <ArrowLeft className="size-4" />
                            Back
                        </Button>
                        <Button
                            form="admin-profile-form"
                            type="submit"
                            disabled={mutation.isPending}
                            className="gap-2 bg-blue-600 text-white hover:bg-blue-700"
                        >
                            {mutation.isPending ? <LoaderCircle className="size-4 animate-spin" /> : <Save className="size-4" />}
                            Save
                        </Button>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
                    <Card className="h-fit rounded-xl">
                        <CardHeader>
                            <CardTitle className="text-base">Account</CardTitle>
                            <CardDescription>Read-only portal identity.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm">
                            <div className="rounded-lg border p-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex size-11 items-center justify-center rounded-full bg-muted">
                                        <User className="size-5" />
                                    </div>
                                    <div className="min-w-0">
                                        <div className="truncate font-medium">{currentAdmin.username}</div>
                                        <div className="truncate text-muted-foreground">{currentAdmin.email}</div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="text-xs uppercase tracking-wide text-muted-foreground">Profile status</div>
                                <div className="rounded-lg border px-3 py-2 text-sm">
                                    {profile?.id ? 'Profile already linked in frieren-core.' : 'No admin profile yet. Create one now.'}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="text-xs uppercase tracking-wide text-muted-foreground">Permissions</div>
                                <div className="flex flex-wrap gap-2">
                                    {(currentAdmin.permissions ?? []).slice(0, 8).map((permission) => (
                                        <span key={permission} className="rounded-full border px-2 py-1 text-xs">
                                            {permission}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-xl">
                        <CardHeader>
                            <CardTitle className="text-base">{profile?.id ? 'Update Admin Profile' : 'Create Admin Profile'}</CardTitle>
                            <CardDescription>Profile data is stored in <code>frieren-core</code> admin profiles.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Form {...form}>
                                <form id="admin-profile-form" className="grid gap-6" onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
                                    <input type="hidden" {...form.register('user_admin_id', { valueAsNumber: true })} />

                                    <div className="grid gap-5 md:grid-cols-2">
                                        <FormField
                                            control={form.control}
                                            name="first_name"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>First Name <span className="text-destructive">*</span></FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="First name" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="last_name"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Last Name <span className="text-destructive">*</span></FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Last name" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="employee_code"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Employee Code</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="EMP001" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="phone_number"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Phone Number</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="0900000000" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="avatar"
                                            render={({ field }) => (
                                                <FormItem className="md:col-span-2">
                                                    <FormLabel>Avatar URL</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="https://example.com/avatar.png" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="department"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Department</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="IT / HR / Finance" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="metadata"
                                            render={({ field }) => (
                                                <FormItem className="md:col-span-2">
                                                    <FormLabel>Metadata</FormLabel>
                                                    <FormControl>
                                                        <Textarea className="min-h-32 font-mono text-xs" placeholder='{"level":"senior"}' {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
