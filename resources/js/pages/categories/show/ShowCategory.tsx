import { ResourceShow } from '@/components/custom/resource-show';
import { type ResourceRecord } from '@/components/custom/types';
import { categoryConfig } from '../shema';

export default function ShowCategory({ record }: { record: ResourceRecord }) {
    return <ResourceShow config={categoryConfig} record={record} />;
}
