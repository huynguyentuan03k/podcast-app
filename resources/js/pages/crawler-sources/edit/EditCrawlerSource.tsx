import type { CrawlerSource } from '../shema';
import CrawlerSourceForm from '../form/CrawlerSourceForm';

type Props = { record: CrawlerSource };

export default function EditCrawlerSource({ record }: Props) {
    return <CrawlerSourceForm mode="edit" source={record} />;
}
