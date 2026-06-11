import { ResourceForm } from '@/components/custom/resource-form';
import { userConfig } from '../shema';

export default function CreateUser() {
    return <ResourceForm config={userConfig} mode="create" />;
}
