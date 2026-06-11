import { ResourceForm } from '@/components/custom/resource-form';
import { type ResourceRecord } from '@/components/custom/types';
import { userConfig } from '../shema';

export default function EditUser({ record }: { record: ResourceRecord }) {
    return <ResourceForm config={userConfig} mode="edit" record={record} />;
}
