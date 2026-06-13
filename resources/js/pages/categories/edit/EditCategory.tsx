import type { Category } from '../shema';
import CategoryForm from '../form/CategoryForm';

export default function EditCategory({ record }: { record: Category }) {
    return <CategoryForm mode="edit" category={record} />;
}
