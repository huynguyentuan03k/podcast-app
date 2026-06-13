import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Link } from '@/lib/navigation';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import { authorConfig, type Author } from '../shema';

type ActionsCellAuthorProps = {
    author: Author;
    deleting: boolean;
    onDelete: (record: Author) => void;
    onRequestDelete: (record: Author) => void;
};

export default function ActionsCellAuthor({ author, deleting, onRequestDelete }: ActionsCellAuthorProps) {
    return (
        <div className="flex gap-2">
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button asChild variant="outline" size="icon">
                        <Link href={`${authorConfig.basePath}/${author.id}/show`}>
                            <Eye className="size-4" />
                        </Link>
                    </Button>
                </TooltipTrigger>
                <TooltipContent>View</TooltipContent>
            </Tooltip>

            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        asChild
                        size="icon"
                        className="bg-blue-600 text-white shadow-xs hover:bg-blue-700 focus-visible:ring-blue-500"
                    >
                        <Link href={`${authorConfig.basePath}/${author.id}/edit`}>
                            <Pencil className="size-4" />
                        </Link>
                    </Button>
                </TooltipTrigger>
                <TooltipContent className="bg-blue-600 text-white">Edit</TooltipContent>
            </Tooltip>

            <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="destructive" size="icon" disabled={deleting} onClick={() => onRequestDelete(author)}>
                        <Trash2 className="size-4" />
                    </Button>
                </TooltipTrigger>
                <TooltipContent>Delete</TooltipContent>
            </Tooltip>
        </div>
    );
}
