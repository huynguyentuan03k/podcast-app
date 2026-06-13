import { SpinnerLoading } from '@/components/custom/SpinnerLoading';
import http from '@/http/client';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@/lib/navigation';
import { useQuery } from '@tanstack/react-query';
import { EpisodesSchema, type EpisodeResponse, type Episodes } from '../shema';
import { columns } from './columns';
import { DataTable } from './data-table';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Episodes', href: '/portal/episodes' }];

export default function EpisodeOverview() {
    const { data, isLoading, refetch } = useQuery({
        queryKey: ['Episodes'],
        queryFn: async () => {
            const response = await http.get<EpisodeResponse<Episodes>>('/episodes');

            return {
                data: EpisodesSchema.parse(response.data.data),
                meta: response.data.meta,
            };
        },
    });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Episodes" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto p-4">
                <div>
                    <h1 className="text-2xl font-semibold">Episodes</h1>
                    <p className="text-sm text-muted-foreground">Manage audio episodes from the API controller.</p>
                </div>
                {isLoading ? (
                    <SpinnerLoading />
                ) : (
                    <DataTable data={data?.data ?? []} columns={columns} meta={data?.meta} onRefresh={() => void refetch()} />
                )}
            </div>
        </AppLayout>
    );
}
