import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { Link, useLocation, useParams } from 'react-router-dom';

export default function PortalResourcePage() {
    const { pathname } = useLocation();
    const params = useParams();
    const segments = pathname.split('/').filter(Boolean);
    const resource = params.resource ?? segments[1] ?? 'resource';
    const action = segments[segments.length - 1] === resource ? 'overview' : segments[segments.length - 1] ?? 'overview';
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
