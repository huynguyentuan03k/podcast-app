import AuthorForm from '../form/AuthorForm';
import type { Author } from '../shema';

export default function EditAuthor({ record }: { record: Author }) {
    return <AuthorForm mode="edit" author={record} />;
}
