import type { Admin } from '../shema';
import AdminFormPage from '../form/AdminForm';

export default function EditAdmin({ record }: { record: Admin }) {
    return <AdminFormPage mode="edit" admin={record} />;
}
