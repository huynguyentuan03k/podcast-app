import { ResourceForm } from '@/components/custom/resource-form';
import { authorConfig } from '../shema';

export default function CreateAuthor() {
    return <ResourceForm config={authorConfig} mode="create" />;
}
