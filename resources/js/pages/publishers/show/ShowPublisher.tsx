import { ResourceShow } from '@/components/custom/resource-show';
import { type ResourceRecord } from '@/components/custom/types';
import { publisherConfig } from '../shema';

export default function ShowPublisher({ record }: { record: ResourceRecord }) {
    return <ResourceShow config={publisherConfig} record={record} />;
}
