import { ResourceShow } from '@/components/custom/resource-show';
import { type ResourceRecord } from '@/components/custom/types';
import { authorConfig } from '../shema';

export default function ShowAuthor({ record }: { record: ResourceRecord }) {
    return <ResourceShow config={authorConfig} record={record} />;
}
