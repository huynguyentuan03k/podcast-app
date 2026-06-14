import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { Bell, KeyRound, Lock, Save, User } from 'lucide-react';
import { useState } from 'react';

const tabs = [
    { key: 'profile', label: 'Profile', icon: User },
    { key: 'password', label: 'Password', icon: Lock },
    { key: 'notifications', label: 'Notifications', icon: Bell },
] as const;

const languages = [
    { label: 'EN', value: 'en' },
    { label: 'VI', value: 'vi' },
    { label: 'JA', value: 'ja' },
];

export default function AccountPage() {
    const [activeTab, setActiveTab] = useState<(typeof tabs)[number]['key']>('profile');

    return (
        <AppLayout>
            <div className="flex h-full flex-1 flex-col gap-6 overflow-hidden p-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="text-sm text-muted-foreground">
                        <span>System</span>
                        <span className="mx-2">›</span>
                        <span>General</span>
                        <span className="mx-2">›</span>
                        <span className="text-foreground">Profile</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="rounded-full px-3 py-1">
                            Active
                        </Badge>
                        <Badge variant="outline" className="rounded-full px-3 py-1">
                            Portal
                        </Badge>
                    </div>
                </div>

                <div>
                    <h1 className="text-2xl font-semibold">Profile</h1>
                    <p className="text-sm text-muted-foreground">Manage your account information.</p>
                </div>

                <Separator />

                <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
                    <aside className="space-y-2">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            const active = activeTab === tab.key;

                            return (
                                <button
                                    key={tab.key}
                                    type="button"
                                    onClick={() => setActiveTab(tab.key)}
                                    className={cn(
                                        'flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-medium transition-colors',
                                        active ? 'bg-muted text-foreground' : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground',
                                    )}
                                >
                                    <Icon className="size-4" />
                                    <span>{tab.label}</span>
                                </button>
                            );
                        })}
                    </aside>

                    <Card className="rounded-xl border-border/60">
                        {activeTab === 'profile' && (
                            <>
                                <CardHeader className="flex flex-row items-start justify-between gap-4">
                                    <div className="space-y-1">
                                        <CardTitle>Account Profile</CardTitle>
                                        <CardDescription>This is how others will see you on the site.</CardDescription>
                                    </div>
                                    <Button className="gap-2">
                                        <Save className="size-4" />
                                        Save
                                    </Button>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <Separator />
                                    <div className="grid gap-5 md:grid-cols-2">
                                        <div className="grid gap-2">
                                            <Label htmlFor="first-name">First Name</Label>
                                            <Input id="first-name" defaultValue="Huy" />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="last-name">Last Name</Label>
                                            <Input id="last-name" defaultValue="Nguyen" />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="email">Email</Label>
                                            <Input id="email" type="email" defaultValue="huy.nguyentuan@manifera.com" />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="phone">Phone Number</Label>
                                            <div className="flex items-center gap-2">
                                                <Select defaultValue="nl">
                                                    <SelectTrigger className="w-20">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="nl">NL</SelectItem>
                                                        <SelectItem value="us">US</SelectItem>
                                                        <SelectItem value="vn">VN</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <Input id="phone" defaultValue="+31" />
                                            </div>
                                        </div>
                                        <div className="grid gap-2 md:col-span-2 md:max-w-xl">
                                            <Label htmlFor="language">Display Language</Label>
                                            <Select defaultValue="en">
                                                <SelectTrigger id="language">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {languages.map((language) => (
                                                        <SelectItem key={language.value} value={language.value}>
                                                            {language.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </CardContent>
                            </>
                        )}

                        {activeTab === 'password' && (
                            <>
                                <CardHeader className="flex flex-row items-start justify-between gap-4">
                                    <div className="space-y-1">
                                        <CardTitle>Change Password</CardTitle>
                                        <CardDescription>Update your password and keep your account secure.</CardDescription>
                                    </div>
                                    <Button className="gap-2">
                                        <KeyRound className="size-4" />
                                        Save
                                    </Button>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <Separator />
                                    <div className="grid gap-5 md:max-w-2xl">
                                        <div className="grid gap-2">
                                            <Label htmlFor="current-password">Current password</Label>
                                            <Input id="current-password" type="password" placeholder="Current password" />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="new-password">New password</Label>
                                            <Input id="new-password" type="password" placeholder="New password" />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="confirm-password">Confirm password</Label>
                                            <Input id="confirm-password" type="password" placeholder="Confirm password" />
                                        </div>
                                    </div>
                                </CardContent>
                            </>
                        )}

                        {activeTab === 'notifications' && (
                            <>
                                <CardHeader className="flex flex-row items-start justify-between gap-4">
                                    <div className="space-y-1">
                                        <CardTitle>Notifications</CardTitle>
                                        <CardDescription>Choose how you want to receive updates.</CardDescription>
                                    </div>
                                    <Button className="gap-2">
                                        <Bell className="size-4" />
                                        Save
                                    </Button>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <Separator />
                                    <div className="grid gap-4 md:max-w-3xl">
                                        <label className="flex items-start gap-3 rounded-lg border p-4">
                                            <Checkbox defaultChecked />
                                            <div className="space-y-1">
                                                <div className="font-medium">Email alerts</div>
                                                <div className="text-sm text-muted-foreground">Receive product and security notices by email.</div>
                                            </div>
                                        </label>
                                        <label className="flex items-start gap-3 rounded-lg border p-4">
                                            <Checkbox defaultChecked />
                                            <div className="space-y-1">
                                                <div className="font-medium">System updates</div>
                                                <div className="text-sm text-muted-foreground">
                                                    Notify me about portal updates and maintenance windows.
                                                </div>
                                            </div>
                                        </label>
                                        <label className="flex items-start gap-3 rounded-lg border p-4">
                                            <Checkbox />
                                            <div className="space-y-1">
                                                <div className="font-medium">Mobile push</div>
                                                <div className="text-sm text-muted-foreground">Send urgent alerts to my mobile device.</div>
                                            </div>
                                        </label>
                                    </div>
                                </CardContent>
                            </>
                        )}
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
