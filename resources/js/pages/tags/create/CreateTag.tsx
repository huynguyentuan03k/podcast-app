import { ResourceForm } from '@/components/custom/resource-form';
import { tagConfig } from '../shema';

export default function CreateTag() {
    return <ResourceForm config={tagConfig} mode="create" />;
}
