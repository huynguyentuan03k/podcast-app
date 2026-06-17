import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Link } from '@/lib/navigation';
import { Eye, Pencil, Play, Trash2 } from 'lucide-react';
import { crawlerItemConfig, type CrawlerItem } from '../shema';

type ActionsCellCrawlerItemProps = {
    item: CrawlerItem;
    crawling: boolean;
    deleting: boolean;
    onCrawl: (item: CrawlerItem) => void;
    onRequestDelete: (item: CrawlerItem) => void;
};

export default function ActionsCellCrawlerItem({ item, crawling, deleting, onCrawl, onRequestDelete }: ActionsCellCrawlerItemProps) {
    return (
        <div className="flex gap-2">
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button asChild variant="outline" size="icon">
                        <Link href={`${crawlerItemConfig.basePath}/${item.id}/show`}>
                            <Eye className="size-4" />
                        </Link>
                    </Button>
                </TooltipTrigger>
                <TooltipContent>View</TooltipContent>
            </Tooltip>

            <Tooltip>
                <TooltipTrigger asChild>
                    <Button size="icon" className="bg-blue-600 text-white shadow-xs hover:bg-blue-700 focus-visible:ring-blue-500" disabled={crawling} onClick={() => onCrawl(item)}>
                        <Play className="size-4" />
                    </Button>
                </TooltipTrigger>
                <TooltipContent className="bg-blue-600 text-white">Crawl item</TooltipContent>
            </Tooltip>

            <Tooltip>
                <TooltipTrigger asChild>
                    <Button asChild size="icon" className="bg-green-600 text-white shadow-xs hover:bg-green-700 focus-visible:ring-green-500">
                        <Link href={`${crawlerItemConfig.basePath}/${item.id}/edit`}>
                            <Pencil className="size-4" />
                        </Link>
                    </Button>
                </TooltipTrigger>
                <TooltipContent className="bg-green-600 text-white">Edit</TooltipContent>
            </Tooltip>

            <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="destructive" size="icon" disabled={deleting} onClick={() => onRequestDelete(item)}>
                        <Trash2 className="size-4" />
                    </Button>
                </TooltipTrigger>
                <TooltipContent>Delete</TooltipContent>
            </Tooltip>
        </div>
    );
}
