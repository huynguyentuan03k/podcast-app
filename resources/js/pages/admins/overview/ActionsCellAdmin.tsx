import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Link } from '@/lib/navigation';
import { Eye, LoaderCircle, Pencil, Trash2 } from 'lucide-react';
import { adminConfig, type Admin } from '../shema';

type ActionsCellAdminProps = {
    admin: Admin;
    deleting: boolean;
    onRequestDelete: (admin: Admin) => void;
};

export default function ActionsCellAdmin({ admin, deleting, onRequestDelete }: ActionsCellAdminProps) {
    return (
        <div className="flex items-center justify-end gap-1">
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button asChild variant="ghost" size="icon" className="text-blue-600 hover:bg-blue-50 hover:text-blue-700">
                        <Link href={`${adminConfig.basePath}/${admin.id}/show`}>
                            <Eye className="size-4" />
                        </Link>
                    </Button>
                </TooltipTrigger>
                <TooltipContent className="bg-blue-600 text-white">View admin</TooltipContent>
            </Tooltip>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button asChild variant="ghost" size="icon" className="text-blue-600 hover:bg-blue-50 hover:text-blue-700">
                        <Link href={`${adminConfig.basePath}/${admin.id}/edit`}>
                            <Pencil className="size-4" />
                        </Link>
                    </Button>
                </TooltipTrigger>
                <TooltipContent className="bg-blue-600 text-white">Edit admin</TooltipContent>
            </Tooltip>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-destructive hover:bg-red-50 hover:text-destructive" disabled={deleting} onClick={() => onRequestDelete(admin)}>
                        {deleting ? <LoaderCircle className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
                    </Button>
                </TooltipTrigger>
                <TooltipContent>Delete admin</TooltipContent>
            </Tooltip>
        </div>
    );
}
