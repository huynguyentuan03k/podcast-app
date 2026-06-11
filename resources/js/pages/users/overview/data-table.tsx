import { ResourceDataTable } from '@/components/custom/resource-data-table';
import { userConfig } from '../shema';

export function DataTable() {
    return <ResourceDataTable config={userConfig} />;
}
