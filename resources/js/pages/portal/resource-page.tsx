import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import AuthorOverview from '@/pages/authors/overview/AuthorOverview';
import CreateAuthor from '@/pages/authors/create/CreateAuthor';
import EditAuthor from '@/pages/authors/edit/EditAuthor';
import ShowAuthor from '@/pages/authors/show/ShowAuthor';
import CategoryOverview from '@/pages/categories/overview/CategoryOverview';
import CreateCategory from '@/pages/categories/create/CreateCategory';
import EditCategory from '@/pages/categories/edit/EditCategory';
import ShowCategory from '@/pages/categories/show/ShowCategory';
import PodcastOverview from '@/pages/podcasts/overview/PodcastOverview';
import CreatePodcast from '@/pages/podcasts/create/CreatePodcast';
import EditPodcast from '@/pages/podcasts/edit/EditPodcast';
import ShowPodcast from '@/pages/podcasts/show/ShowPodcast';
import PublisherOverview from '@/pages/publishers/overview/PublisherOverview';
import CreatePublisher from '@/pages/publishers/create/CreatePublisher';
import EditPublisher from '@/pages/publishers/edit/EditPublisher';
import ShowPublisher from '@/pages/publishers/show/ShowPublisher';
import EpisodeOverview from '@/pages/episodes/overview/EpisodeOverview';
import CreateEpisode from '@/pages/episodes/create/CreateEpisode';
import EditEpisode from '@/pages/episodes/edit/EditEpisode';
import ShowEpisode from '@/pages/episodes/show/ShowEpisode';
import http from '@/http/client';
import { useQuery } from '@tanstack/react-query';
import { Link, useLocation, useParams } from 'react-router-dom';
import { authorConfig, type Author } from '../authors/shema';
import { categoryConfig, type Category } from '../categories/shema';
import { podcastConfig, type Podcast } from '../podcasts/shema';
import { publisherConfig, type Publisher } from '../publishers/shema';
import { episodeConfig, type Episode } from '../episodes/shema';

function AuthorRecordLoader({ id, mode }: { id: string; mode: 'edit' | 'show' }) {
    const { data, isLoading } = useQuery({
        queryKey: ['authors', id],
        queryFn: async () => {
            const response = await http.get<{ data: Author }>(`/authors/${id}`);

            return response.data.data;
        },
        enabled: Boolean(id),
    });

    if (isLoading) {
        return (
            <AppLayout breadcrumbs={authorConfig.breadcrumbs}>
                <div className="p-4 text-sm text-muted-foreground">Loading author...</div>
            </AppLayout>
        );
    }

    if (!data) {
        return (
            <AppLayout breadcrumbs={authorConfig.breadcrumbs}>
                <div className="p-4 text-sm text-muted-foreground">Author not found.</div>
            </AppLayout>
        );
    }

    return mode === 'edit' ? <EditAuthor record={data} /> : <ShowAuthor record={data} />;
}

function CategoryRecordLoader({ id, mode }: { id: string; mode: 'edit' | 'show' }) {
    const { data, isLoading } = useQuery({
        queryKey: ['categories', id],
        queryFn: async () => {
            const response = await http.get<{ data: Category }>(`/categories/${id}`);

            return response.data.data;
        },
        enabled: Boolean(id),
    });

    if (isLoading) {
        return (
            <AppLayout breadcrumbs={categoryConfig.breadcrumbs}>
                <div className="p-4 text-sm text-muted-foreground">Loading category...</div>
            </AppLayout>
        );
    }

    if (!data) {
        return (
            <AppLayout breadcrumbs={categoryConfig.breadcrumbs}>
                <div className="p-4 text-sm text-muted-foreground">Category not found.</div>
            </AppLayout>
        );
    }

    return mode === 'edit' ? <EditCategory record={data} /> : <ShowCategory record={data} />;
}

function PodcastRecordLoader({ id, mode }: { id: string; mode: 'edit' | 'show' }) {
    const { data, isLoading } = useQuery({
        queryKey: ['podcasts', id],
        queryFn: async () => {
            const response = await http.get<{ data: Podcast }>(`/podcasts/${id}`);

            return response.data.data;
        },
        enabled: Boolean(id),
    });

    if (isLoading) {
        return (
            <AppLayout breadcrumbs={podcastConfig.breadcrumbs}>
                <div className="p-4 text-sm text-muted-foreground">Loading podcast...</div>
            </AppLayout>
        );
    }

    if (!data) {
        return (
            <AppLayout breadcrumbs={podcastConfig.breadcrumbs}>
                <div className="p-4 text-sm text-muted-foreground">Podcast not found.</div>
            </AppLayout>
        );
    }

    return mode === 'edit' ? <EditPodcast record={data} /> : <ShowPodcast record={data} />;
}

function PublisherRecordLoader({ id, mode }: { id: string; mode: 'edit' | 'show' }) {
    const { data, isLoading } = useQuery({
        queryKey: ['publishers', id],
        queryFn: async () => {
            const response = await http.get<{ data: Publisher }>(`/publishers/${id}`);

            return response.data.data;
        },
        enabled: Boolean(id),
    });

    if (isLoading) {
        return (
            <AppLayout breadcrumbs={publisherConfig.breadcrumbs}>
                <div className="p-4 text-sm text-muted-foreground">Loading publisher...</div>
            </AppLayout>
        );
    }

    if (!data) {
        return (
            <AppLayout breadcrumbs={publisherConfig.breadcrumbs}>
                <div className="p-4 text-sm text-muted-foreground">Publisher not found.</div>
            </AppLayout>
        );
    }

    return mode === 'edit' ? <EditPublisher record={data} /> : <ShowPublisher record={data} />;
}

function EpisodeRecordLoader({ id, mode }: { id: string; mode: 'edit' | 'show' }) {
    const { data, isLoading } = useQuery({
        queryKey: ['episodes', id],
        queryFn: async () => {
            const response = await http.get<{ data: Episode }>(`/episodes/${id}`);

            return response.data.data;
        },
        enabled: Boolean(id),
    });

    if (isLoading) {
        return (
            <AppLayout breadcrumbs={episodeConfig.breadcrumbs}>
                <div className="p-4 text-sm text-muted-foreground">Loading episode...</div>
            </AppLayout>
        );
    }

    if (!data) {
        return (
            <AppLayout breadcrumbs={episodeConfig.breadcrumbs}>
                <div className="p-4 text-sm text-muted-foreground">Episode not found.</div>
            </AppLayout>
        );
    }

    return mode === 'edit' ? <EditEpisode record={data} /> : <ShowEpisode record={data} />;
}

export default function PortalResourcePage() {
    const { pathname } = useLocation();
    const params = useParams();
    const segments = pathname.split('/').filter(Boolean);
    const resource = params.resource ?? segments[1] ?? 'resource';
    const action = segments[segments.length - 1] === resource ? 'overview' : (segments[segments.length - 1] ?? 'overview');
    const id = params.id ?? '';

    const titleMap: Record<string, string> = {
        podcasts: 'Podcasts',
        episodes: 'Episodes',
        publishers: 'Publishers',
        categories: 'Categories',
        tags: 'Tags',
        authors: 'Authors',
        users: 'Users',
    };

    const title = titleMap[resource] ?? resource;

    if (resource === 'authors') {
        if (action === 'create') {
            return <CreateAuthor />;
        }

        if (action === 'edit') {
            return <AuthorRecordLoader id={id} mode="edit" />;
        }

        if (action === 'show') {
            return <AuthorRecordLoader id={id} mode="show" />;
        }

        return <AuthorOverview />;
    }

    if (resource === 'podcasts') {
        if (action === 'create') {
            return <CreatePodcast />;
        }

        if (action === 'edit') {
            return <PodcastRecordLoader id={id} mode="edit" />;
        }

        if (action === 'show') {
            return <PodcastRecordLoader id={id} mode="show" />;
        }

        return <PodcastOverview />;
    }

    if (resource === 'publishers') {
        if (action === 'create') {
            return <CreatePublisher />;
        }

        if (action === 'edit') {
            return <PublisherRecordLoader id={id} mode="edit" />;
        }

        if (action === 'show') {
            return <PublisherRecordLoader id={id} mode="show" />;
        }

        return <PublisherOverview />;
    }

    if (resource === 'episodes') {
        if (action === 'create') {
            return <CreateEpisode />;
        }

        if (action === 'edit') {
            return <EpisodeRecordLoader id={id} mode="edit" />;
        }

        if (action === 'show') {
            return <EpisodeRecordLoader id={id} mode="show" />;
        }

        return <EpisodeOverview />;
    }

    if (resource === 'categories') {
        if (action === 'create') {
            return <CreateCategory />;
        }

        if (action === 'edit') {
            return <CategoryRecordLoader id={id} mode="edit" />;
        }

        if (action === 'show') {
            return <CategoryRecordLoader id={id} mode="show" />;
        }

        return <CategoryOverview />;
    }

    return (
        <AppLayout>
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4">
                <div>
                    <h1 className="text-2xl font-semibold">{title}</h1>
                    <p className="text-sm text-muted-foreground">
                        {action}
                        {id ? ` #${id}` : ''}
                    </p>
                </div>

                <Card className="rounded-lg">
                    <CardHeader>
                        <CardTitle className="text-base">Portal layout is active</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-wrap gap-2">
                        <Button asChild variant="outline">
                            <Link to="/">{'Back to dashboard'}</Link>
                        </Button>
                        <Button asChild variant="outline">
                            <Link to={`/portal/${resource}`}>{'Overview'}</Link>
                        </Button>
                        <Button asChild variant="outline">
                            <Link to={`/portal/${resource}/create`}>{'Create'}</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
