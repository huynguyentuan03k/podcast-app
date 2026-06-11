import { ResourceForm } from '@/components/custom/resource-form';
import { type ResourceRecord } from '@/components/custom/types';
import { podcastConfig } from '../shema';

export default function EditPodcast({ record }: { record: ResourceRecord }) {
    return <ResourceForm config={podcastConfig} mode="edit" record={record} />;
}
