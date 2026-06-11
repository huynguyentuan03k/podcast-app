import { ResourceForm } from '@/components/custom/resource-form';
import { categoryConfig } from '../shema';

export default function CreateCategory() {
    return <ResourceForm config={categoryConfig} mode="create" />;
}
