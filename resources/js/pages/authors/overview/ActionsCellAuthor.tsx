import { ResourceActionCell } from '@/components/custom/action-cell';
import { type ResourceRecord } from '@/components/custom/types';
import { authorConfig } from '../shema';

export default function ActionsCellAuthor({
    author,
    deleting,
    onDelete,
}: {
    author: ResourceRecord;
    deleting: boolean;
    onDelete: (record: ResourceRecord) => void;
}) {
    return <ResourceActionCell config={authorConfig} record={author} deleting={deleting} onDelete={onDelete} />;
}
