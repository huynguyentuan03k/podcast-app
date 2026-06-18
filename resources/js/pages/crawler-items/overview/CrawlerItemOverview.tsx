import AppLayout from '@/layouts/app-layout';
import { Head } from '@/lib/navigation';
import { crawlerItemConfig } from '../shema';
import CrawlerItemsTable from './CrawlerItemsTable';

export default function CrawlerItemOverview() {
    return (
        <AppLayout breadcrumbs={crawlerItemConfig.breadcrumbs}>
            <Head title={crawlerItemConfig.title} />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-auto p-4 md:p-6">
                <CrawlerItemsTable />
            </div>
        </AppLayout>
    );
}
