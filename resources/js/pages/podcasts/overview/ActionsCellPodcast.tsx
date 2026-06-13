import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Link } from '@/lib/navigation';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import { podcastConfig, type Podcast } from '../shema';

type ActionsCellPodcastProps = {
    podcast: Podcast;
    deleting: boolean;
    onDelete: (record: Podcast) => void;
    onRequestDelete: (record: Podcast) => void;
};

export default function ActionsCellPodcast({ podcast, deleting, onRequestDelete }: ActionsCellPodcastProps) {
    return (
        <div className="flex gap-2">
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button asChild variant="outline" size="icon">
                        <Link href={`${podcastConfig.basePath}/${podcast.id}/show`}>
                            <Eye className="size-4" />
                        </Link>
                    </Button>
                </TooltipTrigger>
                <TooltipContent>View</TooltipContent>
            </Tooltip>

            <Tooltip>
                <TooltipTrigger asChild>
                    <Button asChild size="icon" className="bg-blue-600 text-white shadow-xs hover:bg-blue-700 focus-visible:ring-blue-500">
                        <Link href={`${podcastConfig.basePath}/${podcast.id}/edit`}>
                            <Pencil className="size-4" />
                        </Link>
                    </Button>
                </TooltipTrigger>
                <TooltipContent className="bg-blue-600 text-white">Edit</TooltipContent>
            </Tooltip>

            <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="destructive" size="icon" disabled={deleting} onClick={() => onRequestDelete(podcast)}>
                        <Trash2 className="size-4" />
                    </Button>
                </TooltipTrigger>
                <TooltipContent>Delete</TooltipContent>
            </Tooltip>
        </div>
    );
}
