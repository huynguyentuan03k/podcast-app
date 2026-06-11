import { ResourceActionCell } from '@/components/custom/action-cell';
import { type ResourceRecord } from '@/components/custom/types';
import { userConfig } from '../shema';

export default function ActionsCellUser({
    user,
    deleting,
    onDelete,
}: {
    user: ResourceRecord;
    deleting: boolean;
    onDelete: (record: ResourceRecord) => void;
}) {
    return <ResourceActionCell config={userConfig} record={user} deleting={deleting} onDelete={onDelete} />;
}
