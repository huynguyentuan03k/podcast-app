import { ResourceShow } from '@/components/custom/resource-show';
import { type ResourceRecord } from '@/components/custom/types';
import { tagConfig } from '../shema';

export default function ShowTag({ record }: { record: ResourceRecord }) {
    return <ResourceShow config={tagConfig} record={record} />;
}
