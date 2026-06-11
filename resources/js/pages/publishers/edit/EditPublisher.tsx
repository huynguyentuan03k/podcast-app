import { ResourceForm } from '@/components/custom/resource-form';
import { type ResourceRecord } from '@/components/custom/types';
import { publisherConfig } from '../shema';

export default function EditPublisher({ record }: { record: ResourceRecord }) {
    return <ResourceForm config={publisherConfig} mode="edit" record={record} />;
}
