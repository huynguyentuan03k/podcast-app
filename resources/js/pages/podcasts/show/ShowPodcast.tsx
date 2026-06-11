import { ResourceShow } from '@/components/custom/resource-show';
import { type ResourceRecord } from '@/components/custom/types';
import { podcastConfig } from '../shema';

export default function ShowPodcast({ record }: { record: ResourceRecord }) {
    return <ResourceShow config={podcastConfig} record={record} />;
}
