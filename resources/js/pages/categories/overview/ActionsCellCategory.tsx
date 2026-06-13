import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Link } from '@/lib/navigation';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import { categoryConfig, type Category } from '../shema';

type ActionsCellCategoryProps = {
    category: Category;
    deleting: boolean;
    onDelete: (record: Category) => void;
    onRequestDelete: (record: Category) => void;
};

export default function ActionsCellCategory({ category, deleting, onRequestDelete }: ActionsCellCategoryProps) {
    return (
        <div className="flex gap-2">
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button asChild variant="outline" size="icon">
                        <Link href={`${categoryConfig.basePath}/${category.id}/show`}>
                            <Eye className="size-4" />
                        </Link>
                    </Button>
                </TooltipTrigger>
                <TooltipContent>View</TooltipContent>
            </Tooltip>

            <Tooltip>
                <TooltipTrigger asChild>
                    <Button asChild size="icon" className="bg-blue-600 text-white shadow-xs hover:bg-blue-700 focus-visible:ring-blue-500">
                        <Link href={`${categoryConfig.basePath}/${category.id}/edit`}>
                            <Pencil className="size-4" />
                        </Link>
                    </Button>
                </TooltipTrigger>
                <TooltipContent className="bg-blue-600 text-white">Edit</TooltipContent>
            </Tooltip>

            <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="destructive" size="icon" disabled={deleting} onClick={() => onRequestDelete(category)}>
                        <Trash2 className="size-4" />
                    </Button>
                </TooltipTrigger>
                <TooltipContent>Delete</TooltipContent>
            </Tooltip>
        </div>
    );
}
