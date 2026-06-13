import PodcastForm from '../form/PodcastForm';
import type { Podcast } from '../shema';

export default function EditPodcast({ record }: { record: Podcast }) {
    return <PodcastForm mode="edit" podcast={record} />;
}
