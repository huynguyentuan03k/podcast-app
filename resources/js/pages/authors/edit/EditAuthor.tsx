import { ResourceForm } from '@/components/custom/resource-form';
import { type ResourceRecord } from '@/components/custom/types';
import { authorConfig } from '../shema';

export default function EditAuthor({ record }: { record: ResourceRecord }) {
    return <ResourceForm config={authorConfig} mode="edit" record={record} />;
}
