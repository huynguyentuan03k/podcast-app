import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import http from '@/http/client';
import { Link } from '@/lib/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import { type Episode } from '../shema';

export default function ActionsCellEpisode({ episode }: { episode: Episode }) {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: (id: number) => http.delete(`/episodes/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['Episodes'] });
        },
    });

    return (
        <div className="flex gap-2" onClick={(event) => event.stopPropagation()}>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button asChild variant="outline" size="icon">
                            <Link href={`/portal/episodes/${episode.id}/show`}>
                                <Eye className="size-4" />
                            </Link>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>View</TooltipContent>
                </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button asChild variant="outline" size="icon">
                            <Link href={`/portal/episodes/${episode.id}/edit`}>
                                <Pencil className="size-4" />
                            </Link>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Edit</TooltipContent>
                </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="destructive"
                            size="icon"
                            disabled={mutation.isPending}
                            onClick={() => {
                                if (confirm(`Delete episode #${episode.id}?`)) {
                                    mutation.mutate(episode.id);
                                }
                            }}
                        >
                            <Trash2 className="size-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Delete</TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </div>
    );
}
