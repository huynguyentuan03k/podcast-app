import { ResourceDataTable } from '@/components/custom/resource-data-table';
import { podcastConfig } from '../shema';

export function DataTable() {
    return <ResourceDataTable config={podcastConfig} />;
}
