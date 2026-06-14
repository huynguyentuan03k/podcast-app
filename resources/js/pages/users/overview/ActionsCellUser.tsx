import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Link } from '@/lib/navigation';
import { Eye, LoaderCircle, Pencil, Trash2 } from 'lucide-react';
import { userConfig, type User } from '../shema';

type ActionsCellUserProps = {
    user: User;
    deleting: boolean;
    onRequestDelete: (user: User) => void;
};

export default function ActionsCellUser({ user, deleting, onRequestDelete }: ActionsCellUserProps) {
    return (
        <div className="flex items-center justify-end gap-1">
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button asChild variant="ghost" size="icon" className="text-blue-600 hover:bg-blue-50 hover:text-blue-700">
                        <Link href={`${userConfig.basePath}/${user.id}/show`}>
                            <Eye className="size-4" />
                        </Link>
                    </Button>
                </TooltipTrigger>
                <TooltipContent className="bg-blue-600 text-white">View user</TooltipContent>
            </Tooltip>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button asChild variant="ghost" size="icon" className="text-blue-600 hover:bg-blue-50 hover:text-blue-700">
                        <Link href={`${userConfig.basePath}/${user.id}/edit`}>
                            <Pencil className="size-4" />
                        </Link>
                    </Button>
                </TooltipTrigger>
                <TooltipContent className="bg-blue-600 text-white">Edit user</TooltipContent>
            </Tooltip>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-destructive hover:bg-red-50 hover:text-destructive" disabled={deleting} onClick={() => onRequestDelete(user)}>
                        {deleting ? <LoaderCircle className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
                    </Button>
                </TooltipTrigger>
                <TooltipContent>Delete user</TooltipContent>
            </Tooltip>
        </div>
    );
}
