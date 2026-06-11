import { ResourceActionCell } from '@/components/custom/action-cell';
import { type ResourceRecord } from '@/components/custom/types';
import { tagConfig } from '../shema';

export default function ActionsCellTag({
    tag,
    deleting,
    onDelete,
}: {
    tag: ResourceRecord;
    deleting: boolean;
    onDelete: (record: ResourceRecord) => void;
}) {
    return <ResourceActionCell config={tagConfig} record={tag} deleting={deleting} onDelete={onDelete} />;
}
