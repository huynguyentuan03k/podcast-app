import type { AdminRole } from '../shema';
import AdminRoleFormPage from '../form/AdminRoleForm';

export default function EditAdminRole({ record }: { record: AdminRole }) {
    return <AdminRoleFormPage mode="edit" role={record} />;
}
