import { ResourceActionCell } from '@/components/custom/action-cell';
import { type ResourceRecord } from '@/components/custom/types';
import { publisherConfig } from '../shema';

export default function ActionsCellPublisher({
    publisher,
    deleting,
    onDelete,
}: {
    publisher: ResourceRecord;
    deleting: boolean;
    onDelete: (record: ResourceRecord) => void;
}) {
    return <ResourceActionCell config={publisherConfig} record={publisher} deleting={deleting} onDelete={onDelete} />;
}
