import { ResourceActionCell } from '@/components/custom/action-cell';
import { type ResourceRecord } from '@/components/custom/types';
import { podcastConfig } from '../shema';

export default function ActionsCellPodcast({
    podcast,
    deleting,
    onDelete,
}: {
    podcast: ResourceRecord;
    deleting: boolean;
    onDelete: (record: ResourceRecord) => void;
}) {
    return <ResourceActionCell config={podcastConfig} record={podcast} deleting={deleting} onDelete={onDelete} />;
}
