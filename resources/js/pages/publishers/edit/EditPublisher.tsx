import PublisherForm from '../form/PublisherForm';
import type { Publisher } from '../shema';

export default function EditPublisher({ record }: { record: Publisher }) {
    return <PublisherForm mode="edit" publisher={record} />;
}
