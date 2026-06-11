import { ResourceDataTable } from '@/components/custom/resource-data-table';
import { categoryConfig } from '../shema';

export function DataTable() {
    return <ResourceDataTable config={categoryConfig} />;
}
