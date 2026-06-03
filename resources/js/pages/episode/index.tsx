import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Plus } from 'lucide-react';
const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Episodes',
        href: '/episodes',
    },
];
export default function EpisodePage() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="space-y-4 p-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Episodes</h1>
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Episode
                    </Button>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3].map((episode) => (
                        <Card key={episode}>
                            <CardContent className="p-4">
                                <h2 className="text-lg font-semibold">Episode #{episode}</h2>
                                <p className="text-sm text-muted-foreground">Description for episode #{episode}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}
