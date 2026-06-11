import { ResourceActionCell } from '@/components/custom/action-cell';
import { type ResourceRecord } from '@/components/custom/types';
import { categoryConfig } from '../shema';

export default function ActionsCellCategory({
    category,
    deleting,
    onDelete,
}: {
    category: ResourceRecord;
    deleting: boolean;
    onDelete: (record: ResourceRecord) => void;
}) {
    return <ResourceActionCell config={categoryConfig} record={category} deleting={deleting} onDelete={onDelete} />;
}
