import type { CrawlerItem } from '../shema';
import CrawlerItemForm from '../form/CrawlerItemForm';

export default function EditCrawlerItem({ record }: { record: CrawlerItem }) {
    return <CrawlerItemForm mode="edit" item={record} />;
}
