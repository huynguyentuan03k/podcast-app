import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import http from '@/http/client';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@/lib/navigation';
import { formatDateTime } from '@/lib/date-format';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { userConfig, type User } from '../shema';

function DetailItem({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="space-y-1">
            <p className="text-xs text-muted-foreground">{label}:</p>
            <div className="text-sm font-medium">{children || <span className="italic text-muted-foreground">Not available</span>}</div>
        </div>
    );
}

function BooleanBadge({ value }: { value?: boolean | null }) {
    return value ? <Badge className="bg-emerald-600">Enabled</Badge> : <Badge variant="secondary">Disabled</Badge>;
}

function JsonPreview({ value }: { value: unknown }) {
    if (!value) {
        return <span className="italic text-muted-foreground">Not available</span>;
    }

    return <pre className="max-h-52 overflow-auto rounded-md bg-muted p-3 text-xs">{JSON.stringify(value, null, 2)}</pre>;
}

export default function ShowUser({ record }: { record: User }) {
    const navigate = useNavigate();
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const devices = record.devices ?? [];
    const socialAccounts = record.social_accounts ?? [];

    const deleteMutation = useMutation({
        mutationFn: () => http.delete(`/users/${record.id}`),
        onSuccess: async () => {
            toast({ title: 'delete user successfully', description: 'user has been deleted.' });
            await queryClient.invalidateQueries({ queryKey: ['users'] });
            navigate(userConfig.basePath);
        },
        onError: () => {
            toast({ title: 'delete user failed', description: 'Something went wrong', variant: 'destructive' });
        },
    });

    return (
        <AppLayout breadcrumbs={[...userConfig.breadcrumbs, { title: `ID: ${record.id}`, href: '#' }]}>
            <Head title={`User #${record.id}`} />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-auto p-4 md:p-6">
                <div className="flex items-start justify-between gap-4">
                    <h1 className="text-2xl font-semibold">User Details</h1>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" className="gap-2 shadow-sm" onClick={() => navigate(-1)}>
                            <ArrowLeft className="size-4" />
                            Back
                        </Button>
                        <Button variant="destructive" className="gap-2 shadow-sm" disabled={deleteMutation.isPending} onClick={() => deleteMutation.mutate()}>
                            <Trash2 className="size-4" />
                            Delete
                        </Button>
                        <Button asChild className="gap-2 bg-blue-600 text-white shadow-sm hover:bg-blue-700 focus-visible:ring-blue-500">
                            <Link href={`${userConfig.basePath}/${record.id}/edit`}>
                                <Pencil className="size-4" />
                                Edit
                            </Link>
                        </Button>
                    </div>
                </div>

                <section className="rounded-lg border bg-card p-6 shadow-sm">
                    <h2 className="mb-8 text-base font-semibold">Account Information</h2>
                    <div className="grid gap-x-12 gap-y-8 md:grid-cols-[auto_1fr_1fr_1fr]">
                        <div className="row-span-2">
                            <Avatar className="size-24">
                                <AvatarImage src={record.profile?.avatar ?? undefined} />
                                <AvatarFallback>{record.name?.slice(0, 2).toUpperCase() ?? 'U'}</AvatarFallback>
                            </Avatar>
                        </div>
                        <DetailItem label="ID">{record.id}</DetailItem>
                        <DetailItem label="Name">{record.name}</DetailItem>
                        <DetailItem label="Email">{record.email}</DetailItem>
                        <DetailItem label="Email Status">
                            {record.email_verified_at ? <Badge className="bg-emerald-600">Verified</Badge> : <Badge variant="secondary">Unverified</Badge>}
                        </DetailItem>
                        <DetailItem label="Created At">{formatDateTime(record.created_at)}</DetailItem>
                        <DetailItem label="Updated At">{formatDateTime(record.updated_at)}</DetailItem>
                    </div>
                </section>

                <section className="rounded-lg border bg-card p-6 shadow-sm">
                    <h2 className="mb-8 text-base font-semibold">Profile Information</h2>
                    <div className="grid gap-x-12 gap-y-8 md:grid-cols-2 xl:grid-cols-3">
                        <DetailItem label="Display Name">{record.profile?.display_name}</DetailItem>
                        <DetailItem label="Phone Number">{record.profile?.phone_number}</DetailItem>
                        <DetailItem label="Date Of Birth">{record.profile?.date_of_birth}</DetailItem>
                        <DetailItem label="Gender">{record.profile?.gender}</DetailItem>
                        <DetailItem label="Locale">{record.profile?.locale}</DetailItem>
                        <DetailItem label="Timezone">{record.profile?.timezone}</DetailItem>
                        <div className="space-y-1 md:col-span-2 xl:col-span-3">
                            <p className="text-xs text-muted-foreground">Bio:</p>
                            <p className="whitespace-pre-wrap text-sm font-medium">{record.profile?.bio || <span className="italic text-muted-foreground">Not available</span>}</p>
                        </div>
                        <div className="space-y-1 md:col-span-2 xl:col-span-3">
                            <p className="text-xs text-muted-foreground">Metadata:</p>
                            <JsonPreview value={record.profile?.metadata} />
                        </div>
                    </div>
                </section>

                <section className="rounded-lg border bg-card p-6 shadow-sm">
                    <h2 className="mb-8 text-base font-semibold">Preferences</h2>
                    <div className="grid gap-x-12 gap-y-8 md:grid-cols-2 xl:grid-cols-4">
                        <DetailItem label="Language">{record.preference?.language}</DetailItem>
                        <DetailItem label="Theme">{record.preference?.theme}</DetailItem>
                        <DetailItem label="Playback Speed">{record.preference?.playback_speed}</DetailItem>
                        <DetailItem label="Notifications"><BooleanBadge value={record.preference?.notification_enabled} /></DetailItem>
                        <DetailItem label="Email Notifications"><BooleanBadge value={record.preference?.email_notification_enabled} /></DetailItem>
                        <DetailItem label="Push Notifications"><BooleanBadge value={record.preference?.push_notification_enabled} /></DetailItem>
                        <DetailItem label="Autoplay"><BooleanBadge value={record.preference?.autoplay_enabled} /></DetailItem>
                        <DetailItem label="Updated At">{formatDateTime(record.preference?.updated_at)}</DetailItem>
                    </div>
                </section>

                <section className="rounded-lg border bg-card p-6 shadow-sm">
                    <h2 className="mb-8 text-base font-semibold">Devices</h2>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>ID</TableHead>
                                    <TableHead>Device UUID</TableHead>
                                    <TableHead>Platform</TableHead>
                                    <TableHead>Device</TableHead>
                                    <TableHead>App</TableHead>
                                    <TableHead>OS</TableHead>
                                    <TableHead>Last Seen</TableHead>
                                    <TableHead>Revoked</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {devices.length ? devices.map((device) => (
                                    <TableRow key={device.id}>
                                        <TableCell>{device.id}</TableCell>
                                        <TableCell className="max-w-64 truncate">{device.device_uuid}</TableCell>
                                        <TableCell>{device.platform ?? '-'}</TableCell>
                                        <TableCell>{device.device_name ?? '-'}</TableCell>
                                        <TableCell>{device.app_version ?? '-'}</TableCell>
                                        <TableCell>{device.os_version ?? '-'}</TableCell>
                                        <TableCell>{formatDateTime(device.last_seen_at)}</TableCell>
                                        <TableCell>{device.revoked_at ? <Badge variant="destructive">Revoked</Badge> : <Badge variant="outline">Active</Badge>}</TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow>
                                        <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">No devices found.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </section>

                <section className="rounded-lg border bg-card p-6 shadow-sm">
                    <h2 className="mb-8 text-base font-semibold">Social Accounts</h2>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>ID</TableHead>
                                    <TableHead>Provider</TableHead>
                                    <TableHead>Provider User ID</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Nickname</TableHead>
                                    <TableHead>Token Expires</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {socialAccounts.length ? socialAccounts.map((account) => (
                                    <TableRow key={account.id}>
                                        <TableCell>{account.id}</TableCell>
                                        <TableCell>{account.provider ?? '-'}</TableCell>
                                        <TableCell className="max-w-64 truncate">{account.provider_user_id ?? '-'}</TableCell>
                                        <TableCell>{account.email ?? '-'}</TableCell>
                                        <TableCell>{account.nickname ?? '-'}</TableCell>
                                        <TableCell>{formatDateTime(account.token_expires_at)}</TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">No social accounts found.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </section>
            </div>
        </AppLayout>
    );
}
