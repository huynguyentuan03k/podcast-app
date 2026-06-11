import { ResourceDataTable } from '@/components/custom/resource-data-table';
import { authorConfig } from '../shema';

export function DataTable() {
    return <ResourceDataTable config={authorConfig} />;
}
