import type { User } from '../shema';
import UserForm from '../form/UserForm';

export default function EditUser({ record }: { record: User }) {
    return <UserForm mode="edit" user={record} />;
}
