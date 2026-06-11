import AppLayout from '@/layouts/app-layout';
import { Link } from 'react-router-dom';
import { Bar, BarChart, Cell, Pie, PieChart, XAxis, YAxis } from 'recharts';

import { ChartContainer, ChartLegend, ChartTooltip } from '@/components/ui/chart';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AudioLines, CircleDot, LibraryBig, MessageSquareMore, Podcast, Sparkles } from 'lucide-react';

const chartData = [
    { month: 'Jan', podcasts: 18, episodes: 42 },
    { month: 'Feb', podcasts: 22, episodes: 51 },
    { month: 'Mar', podcasts: 16, episodes: 39 },
    { month: 'Apr', podcasts: 31, episodes: 62 },
    { month: 'May', podcasts: 28, episodes: 58 },
    { month: 'Jun', podcasts: 35, episodes: 73 },
];

const statusData = [
    { name: 'Published', value: 64, color: '#6d5efc' },
    { name: 'Draft', value: 18, color: '#24b8b8' },
    { name: 'Scheduled', value: 12, color: '#f59e0b' },
    { name: 'Archived', value: 6, color: '#ef4444' },
];

const recentItems = [
    { title: 'Design Sprint Weekly', type: 'Podcast', status: 'Published', updatedAt: '2 min ago' },
    { title: 'Build with React', type: 'Episode', status: 'Draft', updatedAt: '15 min ago' },
    { title: 'Creator Stories', type: 'Publisher', status: 'Published', updatedAt: '1 hour ago' },
    { title: 'Audio Pipeline Notes', type: 'Episode', status: 'Scheduled', updatedAt: '3 hours ago' },
    { title: 'API Growth Report', type: 'Podcast', status: 'Published', updatedAt: 'Yesterday' },
];

const chartConfig = {
    podcasts: { label: 'Podcasts', color: '#6d5efc' },
    episodes: { label: 'Episodes', color: '#24b8b8' },
};

const statusConfig = {
    published: { label: 'Published', color: '#6d5efc' },
    draft: { label: 'Draft', color: '#24b8b8' },
    scheduled: { label: 'Scheduled', color: '#f59e0b' },
    archived: { label: 'Archived', color: '#ef4444' },
};

const stats = [
    { label: 'Podcasts', value: '132', icon: Podcast, accent: 'from-indigo-500/20 to-indigo-500/5', color: 'text-indigo-500' },
    { label: 'Episodes', value: '428', icon: AudioLines, accent: 'from-cyan-500/20 to-cyan-500/5', color: 'text-cyan-500' },
    { label: 'Publishers', value: '28', icon: LibraryBig, accent: 'from-amber-500/20 to-amber-500/5', color: 'text-amber-500' },
    { label: 'Notifications', value: '16', icon: MessageSquareMore, accent: 'from-rose-500/20 to-rose-500/5', color: 'text-rose-500' },
];

export default function Dashboard() {
    return (
        <AppLayout>
            <div className="flex h-full flex-1 flex-col gap-6 overflow-hidden p-4">
                <div className="flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-semibold">Admin portal</h1>
                        <p className="text-sm text-muted-foreground">Overview of podcast content, publishing status, and recent updates.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button asChild variant="outline">
                            <Link to="/portal/podcasts">Open podcasts</Link>
                        </Button>
                        <Button asChild>
                            <Link to="/portal/episodes/create">Create episode</Link>
                        </Button>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {stats.map((item) => {
                        const Icon = item.icon;

                        return (
                            <Card key={item.label} className="overflow-hidden rounded-xl border-border/60 bg-gradient-to-br shadow-sm">
                                <CardContent className={`flex items-center justify-between gap-4 bg-gradient-to-br ${item.accent} p-5`}>
                                    <div>
                                        <p className="text-sm text-muted-foreground">{item.label}</p>
                                        <div className="mt-1 text-3xl font-semibold tracking-tight">{item.value}</div>
                                    </div>
                                    <div className={`flex size-12 items-center justify-center rounded-2xl bg-background/80 ${item.color}`}>
                                        <Icon className="size-5" />
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                <div className="grid gap-4 xl:grid-cols-[1.5fr_0.9fr]">
                    <Card className="rounded-xl border-border/60 bg-gradient-to-br from-background to-indigo-500/[0.03]">
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2">
                                <Sparkles className="size-4 text-indigo-500" />
                                Publishing volume
                            </CardTitle>
                            <CardDescription>Monthly podcast and episode activity.</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-2">
                            <ChartContainer config={chartConfig} className="h-80 w-full">
                                <BarChart data={chartData} margin={{ left: 4, right: 12, top: 8 }}>
                                    <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={12} />
                                    <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                                    <ChartTooltip />
                                    <ChartLegend />
                                    <Bar dataKey="podcasts" fill="var(--color-podcasts)" radius={[8, 8, 0, 0]} />
                                    <Bar dataKey="episodes" fill="var(--color-episodes)" radius={[8, 8, 0, 0]} />
                                </BarChart>
                            </ChartContainer>
                        </CardContent>
                    </Card>

                    <Card className="rounded-xl border-border/60 bg-gradient-to-br from-background to-cyan-500/[0.03]">
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2">
                                <CircleDot className="size-4 text-cyan-500" />
                                Content status
                            </CardTitle>
                            <CardDescription>Current distribution across all resources.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center justify-center gap-6 pt-2">
                            <ChartContainer config={statusConfig} className="h-72 w-full">
                                <PieChart>
                                    <ChartTooltip />
                                    <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={70} outerRadius={100} paddingAngle={4}>
                                        {statusData.map((entry) => (
                                            <Cell key={entry.name} fill={entry.color} />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ChartContainer>
                            <div className="grid w-full grid-cols-2 gap-2 text-sm">
                                {statusData.map((item) => (
                                    <div key={item.name} className="flex items-center gap-2 rounded-md border border-border/60 bg-background/70 p-2">
                                        <span className="size-2 rounded-full" style={{ backgroundColor: item.color }} />
                                        <span className="text-muted-foreground">{item.name}</span>
                                        <span className="ml-auto font-medium">{item.value}%</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
                    <Card className="rounded-xl border-border/60">
                        <CardHeader className="pb-3">
                            <CardTitle>Recent records</CardTitle>
                            <CardDescription>Latest changes across the portal.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Title</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Updated</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {recentItems.map((item) => (
                                        <TableRow key={`${item.title}-${item.updatedAt}`}>
                                            <TableCell className="font-medium">{item.title}</TableCell>
                                            <TableCell>{item.type}</TableCell>
                                            <TableCell>
                                                <Badge variant="secondary" className="border border-border/60 bg-indigo-500/10 text-indigo-600 dark:text-indigo-300">
                                                    {item.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right text-muted-foreground">{item.updatedAt}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    <Card className="rounded-xl border-border/60">
                        <CardHeader className="pb-3">
                            <CardTitle>Quick actions</CardTitle>
                            <CardDescription>Frequently used portal shortcuts.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-3">
                            <Button asChild variant="outline" className="justify-start border-indigo-500/20 bg-indigo-500/5 hover:bg-indigo-500/10">
                                <Link to="/portal/podcasts">Manage podcasts</Link>
                            </Button>
                            <Button asChild variant="outline" className="justify-start border-cyan-500/20 bg-cyan-500/5 hover:bg-cyan-500/10">
                                <Link to="/portal/episodes">Manage episodes</Link>
                            </Button>
                            <Button asChild variant="outline" className="justify-start border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10">
                                <Link to="/portal/publishers">Manage publishers</Link>
                            </Button>
                            <Button asChild variant="outline" className="justify-start border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10">
                                <Link to="/portal/categories">Manage categories</Link>
                            </Button>
                            <Button asChild variant="outline" className="justify-start border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10">
                                <Link to="/portal/tags">Manage tags</Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
