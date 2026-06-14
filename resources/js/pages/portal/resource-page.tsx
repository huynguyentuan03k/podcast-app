import { authorizeCheck } from '@/authorization';
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
import TagOverview from '@/pages/tags/overview/TagOverview';
import ShowTag from '@/pages/tags/show/ShowTag';
import AdminOverview from '@/pages/admins/overview/AdminOverview';
import CreateAdmin from '@/pages/admins/create/CreateAdmin';
import EditAdmin from '@/pages/admins/edit/EditAdmin';
import ShowAdmin from '@/pages/admins/show/ShowAdmin';
import UserOverview from '@/pages/users/overview/UserOverview';
import CreateUser from '@/pages/users/create/CreateUser';
import EditUser from '@/pages/users/edit/EditUser';
import ShowUser from '@/pages/users/show/ShowUser';
import AdminRoleOverview from '@/pages/admin-roles/overview/AdminRoleOverview';
import CreateAdminRole from '@/pages/admin-roles/create/CreateAdminRole';
import EditAdminRole from '@/pages/admin-roles/edit/EditAdminRole';
import ShowAdminRole from '@/pages/admin-roles/show/ShowAdminRole';
import http from '@/http/client';
import { useQuery } from '@tanstack/react-query';
import { Link, useLocation, useParams } from 'react-router-dom';
import { authorConfig, type Author } from '../authors/shema';
import { categoryConfig, type Category } from '../categories/shema';
import { podcastConfig, type Podcast } from '../podcasts/shema';
import { publisherConfig, type Publisher } from '../publishers/shema';
import { episodeConfig, type Episode } from '../episodes/shema';
import { tagConfig, type Tag } from '../tags/shema';
import { adminConfig, type Admin } from '../admins/shema';
import { userConfig, type User } from '../users/shema';
import { adminRoleConfig, type AdminRole } from '../admin-roles/shema';

function UnauthorizedPage() {
    return (
        <AppLayout>
            <div className="flex h-full flex-1 items-center justify-center p-6">
                <Card className="w-full max-w-md rounded-lg text-center">
                    <CardHeader>
                        <CardTitle>Permission denied</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground">You do not have permission to access this page.</p>
                        <Button asChild variant="outline">
                            <Link to="/">Back to dashboard</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

function authorizeResourceAction(resource: string, action: string) {
    const permissions: Record<string, Record<string, string>> = {
        authors: {
            overview: 'VIEW_AUTHOR',
            show: 'VIEW_AUTHOR',
            create: 'CREATE_AUTHOR',
            edit: 'UPDATE_AUTHOR',
        },
        categories: {
            overview: 'VIEW_CATEGORY',
            show: 'VIEW_CATEGORY',
            create: 'CREATE_CATEGORY',
            edit: 'UPDATE_CATEGORY',
        },
        episodes: {
            overview: 'VIEW_EPISODE',
            show: 'VIEW_EPISODE',
            create: 'CREATE_EPISODE',
            edit: 'UPDATE_EPISODE',
        },
        podcasts: {
            overview: 'VIEW_PODCAST',
            show: 'VIEW_PODCAST',
            create: 'CREATE_PODCAST',
            edit: 'UPDATE_PODCAST',
        },
        publishers: {
            overview: 'VIEW_PUBLISHER',
            show: 'VIEW_PUBLISHER',
            create: 'CREATE_PUBLISHER',
            edit: 'UPDATE_PUBLISHER',
        },
        tags: {
            overview: 'VIEW_TAG',
            show: 'VIEW_TAG',
            create: 'CREATE_TAG',
            edit: 'UPDATE_TAG',
        },
        users: {
            overview: 'VIEW_USER',
            show: 'VIEW_USER',
            create: 'CREATE_USER',
            edit: 'UPDATE_USER',
        },
        admins: {
            overview: 'VIEW_ADMIN_USER',
            show: 'VIEW_ADMIN_USER',
            create: 'CREATE_ADMIN_USER',
            edit: 'UPDATE_ADMIN_USER',
        },
        'admin-roles': {
            overview: 'VIEW_ROLE',
            show: 'VIEW_ROLE',
            create: 'CREATE_ROLE',
            edit: 'UPDATE_ROLE',
        },
    };

    const permission = permissions[resource]?.[action] ?? 'ANY';

    return authorizeCheck(permission);
}

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

function TagRecordLoader({ id }: { id: string }) {
    const { data, isLoading } = useQuery({
        queryKey: ['tags', id],
        queryFn: async () => {
            const response = await http.get<{ data: Tag }>(`/tags/${id}`);

            return response.data.data;
        },
        enabled: Boolean(id),
    });

    if (isLoading) {
        return (
            <AppLayout breadcrumbs={tagConfig.breadcrumbs}>
                <div className="p-4 text-sm text-muted-foreground">Loading tag...</div>
            </AppLayout>
        );
    }

    if (!data) {
        return (
            <AppLayout breadcrumbs={tagConfig.breadcrumbs}>
                <div className="p-4 text-sm text-muted-foreground">Tag not found.</div>
            </AppLayout>
        );
    }

    return <ShowTag record={data} />;
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

function AdminRecordLoader({ id, mode }: { id: string; mode: 'edit' | 'show' }) {
    const { data, isLoading } = useQuery({
        queryKey: ['admins', id],
        queryFn: async () => {
            const response = await http.get<{ data: Admin }>(`${adminConfig.apiPath}/${id}`);

            return response.data.data;
        },
        enabled: Boolean(id),
    });

    if (isLoading) {
        return (
            <AppLayout breadcrumbs={adminConfig.breadcrumbs}>
                <div className="p-4 text-sm text-muted-foreground">Loading admin...</div>
            </AppLayout>
        );
    }

    if (!data) {
        return (
            <AppLayout breadcrumbs={adminConfig.breadcrumbs}>
                <div className="p-4 text-sm text-muted-foreground">Admin not found.</div>
            </AppLayout>
        );
    }

    return mode === 'edit' ? <EditAdmin record={data} /> : <ShowAdmin record={data} />;
}

function UserRecordLoader({ id, mode }: { id: string; mode: 'edit' | 'show' }) {
    const { data, isLoading } = useQuery({
        queryKey: ['users', id],
        queryFn: async () => {
            const response = await http.get<{ data: User }>(`/users/${id}`);

            return response.data.data;
        },
        enabled: Boolean(id),
    });

    if (isLoading) {
        return (
            <AppLayout breadcrumbs={userConfig.breadcrumbs}>
                <div className="p-4 text-sm text-muted-foreground">Loading user...</div>
            </AppLayout>
        );
    }

    if (!data) {
        return (
            <AppLayout breadcrumbs={userConfig.breadcrumbs}>
                <div className="p-4 text-sm text-muted-foreground">User not found.</div>
            </AppLayout>
        );
    }

    return mode === 'edit' ? <EditUser record={data} /> : <ShowUser record={data} />;
}

function AdminRoleRecordLoader({ id, mode }: { id: string; mode: 'edit' | 'show' }) {
    const { data, isLoading } = useQuery({
        queryKey: ['admin-roles', id],
        queryFn: async () => {
            const response = await http.get<{ data: AdminRole }>(`${adminRoleConfig.apiPath}/${id}`);

            return response.data.data;
        },
        enabled: Boolean(id),
    });

    if (isLoading) {
        return (
            <AppLayout breadcrumbs={adminRoleConfig.breadcrumbs}>
                <div className="p-4 text-sm text-muted-foreground">Loading admin role...</div>
            </AppLayout>
        );
    }

    if (!data) {
        return (
            <AppLayout breadcrumbs={adminRoleConfig.breadcrumbs}>
                <div className="p-4 text-sm text-muted-foreground">Admin role not found.</div>
            </AppLayout>
        );
    }

    return mode === 'edit' ? <EditAdminRole record={data} /> : <ShowAdminRole record={data} />;
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
        admins: 'Admins',
        'admin-roles': 'Admin Roles',
    };

    const title = titleMap[resource] ?? resource;

    if (!authorizeResourceAction(resource, action)) {
        return <UnauthorizedPage />;
    }

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

    if (resource === 'tags') {
        if (action === 'create') {
            return <TagOverview initialDialogMode="create" />;
        }

        if (action === 'edit') {
            return <TagOverview initialDialogMode="edit" initialTagId={id} />;
        }

        if (action === 'show') {
            return <TagRecordLoader id={id} />;
        }

        return <TagOverview />;
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

    if (resource === 'admins') {
        if (action === 'create') {
            return <CreateAdmin />;
        }

        if (action === 'edit') {
            return <AdminRecordLoader id={id} mode="edit" />;
        }

        if (action === 'show') {
            return <AdminRecordLoader id={id} mode="show" />;
        }

        return <AdminOverview />;
    }

    if (resource === 'users') {
        if (action === 'create') {
            return <CreateUser />;
        }

        if (action === 'edit') {
            return <UserRecordLoader id={id} mode="edit" />;
        }

        if (action === 'show') {
            return <UserRecordLoader id={id} mode="show" />;
        }

        return <UserOverview />;
    }

    if (resource === 'admin-roles') {
        if (action === 'create') {
            return <CreateAdminRole />;
        }

        if (action === 'edit') {
            return <AdminRoleRecordLoader id={id} mode="edit" />;
        }

        if (action === 'show') {
            return <AdminRoleRecordLoader id={id} mode="show" />;
        }

        return <AdminRoleOverview />;
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
