import { ResourceForm } from '@/components/custom/resource-form';
import { podcastConfig } from '../shema';

export default function CreatePodcast() {
    return <ResourceForm config={podcastConfig} mode="create" />;
}
