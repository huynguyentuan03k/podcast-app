import { ResourceDataTable } from '@/components/custom/resource-data-table';
import { publisherConfig } from '../shema';

export function DataTable() {
    return <ResourceDataTable config={publisherConfig} />;
}
