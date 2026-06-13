import { SpinnerLoading } from '@/components/custom/SpinnerLoading';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import http from '@/http/client';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@/lib/navigation';
import { useQuery } from '@tanstack/react-query';
import { Pencil } from 'lucide-react';
import { EpisodeSchema, type Episode } from '../shema';

export default function ShowEpisode({ record }: { record: Episode }) {
    const id = record.id;

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Episodes', href: '/portal/episodes' },
        { title: `Episode #${id}`, href: `/portal/episodes/${id}/show` },
    ];

    const { data, isLoading } = useQuery({
        queryKey: ['episode', id],
        queryFn: async () => {
            const response = await http.get<{ data: Episode }>(`/episodes/${id}`);
            return EpisodeSchema.parse(response.data.data);
        },
        initialData: EpisodeSchema.parse(record),
    });

    if (isLoading) return <SpinnerLoading />;

    const episode = data;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Episode #${id}`} />
            <div className="space-y-4 p-4">
                <div className="flex justify-end gap-2">
                    <Button asChild>
                        <Link href={`/portal/episodes/${episode.id}/edit`}>
                            <Pencil className="mr-2 size-4" />
                            Edit
                        </Link>
                    </Button>
                    <Button variant="outline" onClick={() => router.visit('/portal/episodes')}>
                        Back
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Episode Detail</CardTitle>
                        <CardDescription>Episode information from the API controller.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            <div className="grid gap-1">
                                <Label>Title</Label>
                                <p className="text-sm break-words">{episode.title}</p>
                            </div>
                            <div className="grid gap-1">
                                <Label>Description</Label>
                                <p className="text-sm break-words">{episode.description}</p>
                            </div>
                            <div className="grid gap-1">
                                <Label>Slug</Label>
                                <p className="text-sm break-words">{episode.slug}</p>
                            </div>
                            <div className="grid gap-1">
                                <Label>Podcast ID</Label>
                                <p className="text-sm break-words">{episode.podcast_id}</p>
                            </div>
                            <div className="grid gap-1">
                                <Label>Duration</Label>
                                <p className="text-sm break-words">{episode.duration}</p>
                            </div>
                            <div className="grid gap-1">
                                <Label>Audio</Label>
                                {episode.audio_url ? (
                                    <a
                                        href={episode.audio_url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-sm break-words text-blue-600 underline"
                                    >
                                        {episode.audio_path ?? episode.audio_url}
                                    </a>
                                ) : (
                                    <p className="text-sm break-words">{episode.audio_path}</p>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
