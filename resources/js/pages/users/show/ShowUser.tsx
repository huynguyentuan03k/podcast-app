import { ResourceShow } from '@/components/custom/resource-show';
import { type ResourceRecord } from '@/components/custom/types';
import { userConfig } from '../shema';

export default function ShowUser({ record }: { record: ResourceRecord }) {
    return <ResourceShow config={userConfig} record={record} />;
}
