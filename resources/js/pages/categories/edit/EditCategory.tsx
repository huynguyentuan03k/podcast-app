import { ResourceForm } from '@/components/custom/resource-form';
import { type ResourceRecord } from '@/components/custom/types';
import { categoryConfig } from '../shema';

export default function EditCategory({ record }: { record: ResourceRecord }) {
    return <ResourceForm config={categoryConfig} mode="edit" record={record} />;
}
