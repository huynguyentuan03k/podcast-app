import { ResourceDataTable } from '@/components/custom/resource-data-table';
import { tagConfig } from '../shema';

export function DataTable() {
    return <ResourceDataTable config={tagConfig} />;
}
