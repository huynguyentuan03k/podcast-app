import { ResourceForm } from '@/components/custom/resource-form';
import { publisherConfig } from '../shema';

export default function CreatePublisher() {
    return <ResourceForm config={publisherConfig} mode="create" />;
}
