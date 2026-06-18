import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Link } from '@/lib/navigation';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import { crawlerSourceConfig, type CrawlerSource } from '../shema';

type ActionsCellCrawlerSourceProps = {
    source: CrawlerSource;
    deleting: boolean;
    onRequestDelete: (source: CrawlerSource) => void;
};

export default function ActionsCellCrawlerSource({ source, deleting, onRequestDelete }: ActionsCellCrawlerSourceProps) {
    return (
        <div className="flex gap-2">
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button asChild variant="outline" size="icon">
                        <Link href={`${crawlerSourceConfig.basePath}/${source.id}/show`}>
                            <Eye className="size-4" />
                        </Link>
                    </Button>
                </TooltipTrigger>
                <TooltipContent>View</TooltipContent>
            </Tooltip>

            <Tooltip>
                <TooltipTrigger asChild>
                    <Button asChild size="icon" className="bg-blue-600 text-white shadow-xs hover:bg-blue-700 focus-visible:ring-blue-500">
                        <Link href={`${crawlerSourceConfig.basePath}/${source.id}/edit`}>
                            <Pencil className="size-4" />
                        </Link>
                    </Button>
                </TooltipTrigger>
                <TooltipContent className="bg-blue-600 text-white">Edit</TooltipContent>
            </Tooltip>

            <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="destructive" size="icon" disabled={deleting} onClick={() => onRequestDelete(source)}>
                        <Trash2 className="size-4" />
                    </Button>
                </TooltipTrigger>
                <TooltipContent>Delete</TooltipContent>
            </Tooltip>
        </div>
    );
}
