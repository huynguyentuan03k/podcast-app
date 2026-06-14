import { SpinnerLoading } from '@/components/custom/SpinnerLoading';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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
import { userConfig, UserFormSchema, type User, type UserForm as UserFormValues } from '../shema';

type LaravelValidationError = {
    message?: string;
    errors?: Record<string, string[]>;
};

type UserFormProps = {
    mode: 'create' | 'edit';
    user?: User;
    isLoading?: boolean;
};

function emptyToNull(value?: string) {
    return value?.trim() ? value.trim() : null;
}

function buildUserPayload(values: UserFormValues, mode: 'create' | 'edit') {
    const payload: Record<string, unknown> = {
        name: values.name,
        email: values.email,
        profile: {
            display_name: emptyToNull(values.profile.display_name),
            phone_number: emptyToNull(values.profile.phone_number),
            avatar: emptyToNull(values.profile.avatar),
            date_of_birth: emptyToNull(values.profile.date_of_birth),
            gender: emptyToNull(values.profile.gender),
            bio: emptyToNull(values.profile.bio),
            locale: values.profile.locale || 'en',
            timezone: values.profile.timezone || 'UTC',
        },
        preference: {
            language: values.preference.language || 'en',
            theme: values.preference.theme || 'system',
            notification_enabled: values.preference.notification_enabled,
            email_notification_enabled: values.preference.email_notification_enabled,
            push_notification_enabled: values.preference.push_notification_enabled,
            autoplay_enabled: values.preference.autoplay_enabled,
            playback_speed: values.preference.playback_speed,
        },
    };

    if (mode === 'create' || values.password) {
        payload.password = values.password;
        payload.password_confirmation = values.password_confirmation;
    }

    return payload;
}

function applyLaravelErrors(form: ReturnType<typeof useForm<UserFormValues>>, error: AxiosError<LaravelValidationError>) {
    Object.entries(error.response?.data?.errors ?? {}).forEach(([field, messages]) => {
        form.setError(field as keyof UserFormValues, {
            type: 'server',
            message: messages[0] ?? 'Invalid value.',
        });
    });
}

function BooleanField({ control, name, label }: { control: ReturnType<typeof useForm<UserFormValues>>['control']; name: keyof UserFormValues['preference']; label: string }) {
    return (
        <FormField
            control={control}
            name={`preference.${name}` as const}
            render={({ field }) => (
                <FormItem className="flex items-center gap-3 rounded-md border px-3 py-2">
                    <FormControl>
                        <Checkbox checked={Boolean(field.value)} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormLabel className="m-0 text-sm font-medium">{label}</FormLabel>
                </FormItem>
            )}
        />
    );
}

export default function UserForm({ mode, user, isLoading }: UserFormProps) {
    const navigate = useNavigate();
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const title = mode === 'create' ? 'Create User' : 'Edit User';

    const defaultValues = useMemo<UserFormValues>(
        () => ({
            name: user?.name ?? '',
            email: user?.email ?? '',
            password: '',
            password_confirmation: '',
            profile: {
                display_name: user?.profile?.display_name ?? '',
                phone_number: user?.profile?.phone_number ?? '',
                avatar: user?.profile?.avatar ?? '',
                date_of_birth: user?.profile?.date_of_birth ?? '',
                gender: user?.profile?.gender ?? '',
                bio: user?.profile?.bio ?? '',
                locale: user?.profile?.locale ?? 'en',
                timezone: user?.profile?.timezone ?? 'UTC',
            },
            preference: {
                language: user?.preference?.language ?? 'en',
                theme: user?.preference?.theme ?? 'system',
                notification_enabled: user?.preference?.notification_enabled ?? true,
                email_notification_enabled: user?.preference?.email_notification_enabled ?? true,
                push_notification_enabled: user?.preference?.push_notification_enabled ?? true,
                autoplay_enabled: user?.preference?.autoplay_enabled ?? false,
                playback_speed: Number(user?.preference?.playback_speed ?? 1),
            },
        }),
        [user],
    );

    const form = useForm<UserFormValues>({
        resolver: zodResolver(UserFormSchema) as Resolver<UserFormValues>,
        values: defaultValues,
    });

    const mutation = useMutation({
        mutationFn: async (values: UserFormValues) => {
            const payload = buildUserPayload(values, mode);

            return mode === 'create' ? http.post<User>('/users', payload) : http.put<User>(`/users/${user?.id}`, payload);
        },
        onSuccess: async () => {
            toast({
                title: mode === 'create' ? 'create user successfully' : 'update user successfully',
                description: mode === 'create' ? 'user has been store.' : 'user has been updated.',
            });
            await queryClient.invalidateQueries({ queryKey: ['users'] });
            navigate(userConfig.basePath);
        },
        onError: (error: AxiosError<LaravelValidationError>) => {
            toast({
                title: mode === 'create' ? 'create user failed' : 'update user failed',
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
        <AppLayout breadcrumbs={[...userConfig.breadcrumbs, ...(user ? [{ title: `ID: ${user.id}`, href: `${userConfig.basePath}/${user.id}/show` }] : []), { title, href: '#' }]}>
            <Head title={title} />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-auto p-4 md:p-6">
                <div className="flex items-start justify-between gap-4">
                    <h1 className="text-2xl font-semibold">{mode === 'create' ? 'Users Create' : 'Users Edit'}</h1>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" className="gap-2 shadow-sm" onClick={() => navigate(-1)}>
                            <ArrowLeft className="size-4" />
                            Cancel
                        </Button>
                        <Button form="user-form" type="submit" disabled={mutation.isPending} className="gap-2 bg-blue-600 text-white shadow-sm hover:bg-blue-700 focus-visible:ring-blue-500">
                            {mutation.isPending ? <LoaderCircle className="size-4 animate-spin" /> : <Save className="size-4" />}
                            Save
                        </Button>
                    </div>
                </div>

                <Form {...form}>
                    <form id="user-form" onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
                        <div className="space-y-4">
                            <section className="rounded-lg border bg-card p-6 shadow-sm">
                                <h2 className="mb-6 text-base font-semibold">Account Information</h2>
                                <div className="grid grid-cols-1 gap-x-8 gap-y-6 lg:grid-cols-3">
                                    <FormField control={form.control} name="name" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Name <span className="text-destructive">*</span></FormLabel>
                                            <FormControl><Input placeholder="End user name" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                    <FormField control={form.control} name="email" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email <span className="text-destructive">*</span></FormLabel>
                                            <FormControl><Input placeholder="user@example.com" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                    <div />
                                    <FormField control={form.control} name="password" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Password {mode === 'create' ? <span className="text-destructive">*</span> : null}</FormLabel>
                                            <FormControl><Input type="password" placeholder={mode === 'create' ? 'At least 8 characters' : 'Leave blank to keep current password'} {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                    <FormField control={form.control} name="password_confirmation" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Confirm Password {mode === 'create' ? <span className="text-destructive">*</span> : null}</FormLabel>
                                            <FormControl><Input type="password" placeholder="Confirm password" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                </div>
                            </section>

                            <section className="rounded-lg border bg-card p-6 shadow-sm">
                                <h2 className="mb-6 text-base font-semibold">Profile Information</h2>
                                <div className="grid grid-cols-1 gap-x-8 gap-y-6 lg:grid-cols-3">
                                    <FormField control={form.control} name="profile.display_name" render={({ field }) => (
                                        <FormItem><FormLabel>Display Name</FormLabel><FormControl><Input placeholder="Display name" {...field} /></FormControl><FormMessage /></FormItem>
                                    )} />
                                    <FormField control={form.control} name="profile.phone_number" render={({ field }) => (
                                        <FormItem><FormLabel>Phone Number</FormLabel><FormControl><Input placeholder="+84..." {...field} /></FormControl><FormMessage /></FormItem>
                                    )} />
                                    <FormField control={form.control} name="profile.avatar" render={({ field }) => (
                                        <FormItem><FormLabel>Avatar URL</FormLabel><FormControl><Input placeholder="https://example.com/avatar.png" {...field} /></FormControl><FormMessage /></FormItem>
                                    )} />
                                    <FormField control={form.control} name="profile.date_of_birth" render={({ field }) => (
                                        <FormItem><FormLabel>Date Of Birth</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                                    )} />
                                    <FormField control={form.control} name="profile.gender" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Gender</FormLabel>
                                            <Select value={field.value || 'unknown'} onValueChange={(value) => field.onChange(value === 'unknown' ? '' : value)}>
                                                <FormControl><SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger></FormControl>
                                                <SelectContent>
                                                    <SelectItem value="unknown">Unknown</SelectItem>
                                                    <SelectItem value="male">Male</SelectItem>
                                                    <SelectItem value="female">Female</SelectItem>
                                                    <SelectItem value="other">Other</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                    <FormField control={form.control} name="profile.locale" render={({ field }) => (
                                        <FormItem><FormLabel>Locale</FormLabel><FormControl><Input placeholder="en" {...field} /></FormControl><FormMessage /></FormItem>
                                    )} />
                                    <FormField control={form.control} name="profile.timezone" render={({ field }) => (
                                        <FormItem><FormLabel>Timezone</FormLabel><FormControl><Input placeholder="Asia/Ho_Chi_Minh" {...field} /></FormControl><FormMessage /></FormItem>
                                    )} />
                                    <FormField control={form.control} name="profile.bio" render={({ field }) => (
                                        <FormItem className="lg:col-span-3">
                                            <FormLabel>Bio</FormLabel>
                                            <FormControl><Textarea className="min-h-32" placeholder="User biography" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                </div>
                            </section>

                            <section className="rounded-lg border bg-card p-6 shadow-sm">
                                <h2 className="mb-6 text-base font-semibold">Preferences</h2>
                                <div className="grid grid-cols-1 gap-x-8 gap-y-6 lg:grid-cols-3">
                                    <FormField control={form.control} name="preference.language" render={({ field }) => (
                                        <FormItem><FormLabel>Language</FormLabel><FormControl><Input placeholder="en" {...field} /></FormControl><FormMessage /></FormItem>
                                    )} />
                                    <FormField control={form.control} name="preference.theme" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Theme</FormLabel>
                                            <Select value={field.value || 'system'} onValueChange={field.onChange}>
                                                <FormControl><SelectTrigger><SelectValue placeholder="Select theme" /></SelectTrigger></FormControl>
                                                <SelectContent>
                                                    <SelectItem value="system">System</SelectItem>
                                                    <SelectItem value="light">Light</SelectItem>
                                                    <SelectItem value="dark">Dark</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                    <FormField control={form.control} name="preference.playback_speed" render={({ field }) => (
                                        <FormItem><FormLabel>Playback Speed</FormLabel><FormControl><Input type="number" step="0.05" min="0.25" max="3" {...field} /></FormControl><FormMessage /></FormItem>
                                    )} />
                                    <BooleanField control={form.control} name="notification_enabled" label="Notifications enabled" />
                                    <BooleanField control={form.control} name="email_notification_enabled" label="Email notifications" />
                                    <BooleanField control={form.control} name="push_notification_enabled" label="Push notifications" />
                                    <BooleanField control={form.control} name="autoplay_enabled" label="Autoplay enabled" />
                                </div>
                            </section>
                        </div>
                    </form>
                </Form>
            </div>
        </AppLayout>
    );
}
