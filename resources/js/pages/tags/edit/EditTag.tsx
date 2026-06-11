import { ResourceForm } from '@/components/custom/resource-form';
import { type ResourceRecord } from '@/components/custom/types';
import { tagConfig } from '../shema';

export default function EditTag({ record }: { record: ResourceRecord }) {
    return <ResourceForm config={tagConfig} mode="edit" record={record} />;
}
