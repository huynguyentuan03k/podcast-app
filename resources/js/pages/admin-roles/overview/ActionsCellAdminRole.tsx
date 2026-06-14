import { authorizeCheck } from '@/authorization';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Link } from '@/lib/navigation';
import { Eye, LoaderCircle, Pencil, Trash2 } from 'lucide-react';
import { adminRoleConfig, type AdminRole } from '../shema';

type ActionsCellAdminRoleProps = {
    role: AdminRole;
    deleting: boolean;
    onRequestDelete: (role: AdminRole) => void;
};

export default function ActionsCellAdminRole({ role, deleting, onRequestDelete }: ActionsCellAdminRoleProps) {
    const canUpdate = authorizeCheck('UPDATE_ROLE');
    const canDelete = authorizeCheck('DELETE_ROLE');

    return (
        <div className="flex items-center justify-end gap-1">
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button asChild variant="ghost" size="icon" className="text-blue-600 hover:bg-blue-50 hover:text-blue-700">
                        <Link href={`${adminRoleConfig.basePath}/${role.id}/show`}>
                            <Eye className="size-4" />
                        </Link>
                    </Button>
                </TooltipTrigger>
                <TooltipContent className="bg-blue-600 text-white">View role</TooltipContent>
            </Tooltip>
            {canUpdate ? (
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button asChild variant="ghost" size="icon" className="text-blue-600 hover:bg-blue-50 hover:text-blue-700">
                            <Link href={`${adminRoleConfig.basePath}/${role.id}/edit`}>
                                <Pencil className="size-4" />
                            </Link>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent className="bg-blue-600 text-white">Edit role</TooltipContent>
                </Tooltip>
            ) : null}
            {canDelete ? (
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-destructive hover:bg-red-50 hover:text-destructive" disabled={deleting} onClick={() => onRequestDelete(role)}>
                            {deleting ? <LoaderCircle className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Delete role</TooltipContent>
                </Tooltip>
            ) : null}
        </div>
    );
}
