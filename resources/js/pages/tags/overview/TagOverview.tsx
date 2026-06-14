import { DataTableV1 } from '@/components/custom/data-table-v1';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/hooks/use-toast';
import http from '@/http/client';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@/lib/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import TagDialogForm from '../form/TagDialogForm';
import { tagConfig, type Tag } from '../shema';
import { buildTagIndexUrl, normalizeTagIndexResponse, tagDateRangeFilter } from './filters';
import { getTagColumns } from './columns';
import { defaultTagSorting } from './sorting';

type TagOverviewProps = {
    initialDialogMode?: 'create' | 'edit';
    initialTagId?: string;
};

export default function TagOverview({ initialDialogMode, initialTagId }: TagOverviewProps) {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<Tag | null>(null);
    const [dialogOpen, setDialogOpen] = useState(Boolean(initialDialogMode));
    const [dialogMode, setDialogMode] = useState<'create' | 'edit'>(initialDialogMode ?? 'create');
    const [dialogTag, setDialogTag] = useState<Tag | null>(null);

    const { data: editTag } = useQuery({
        queryKey: ['tags', initialTagId],
        queryFn: async () => {
            const response = await http.get<{ data: Tag }>(`/tags/${initialTagId}`);

            return response.data.data;
        },
        enabled: Boolean(initialDialogMode === 'edit' && initialTagId),
    });

    useEffect(() => {
        if (initialDialogMode === 'edit' && editTag) {
            setDialogTag(editTag);
            setDialogOpen(true);
        }
    }, [editTag, initialDialogMode]);

    const deleteTag = async (tag: Tag) => {
        setDeletingId(tag.id);

        try {
            await http.delete(`/tags/${tag.id}`);
            toast({ title: 'delete tag successfully', description: 'tag has been deleted.' });
            await queryClient.invalidateQueries({ queryKey: ['tags'] });
        } catch {
            toast({ title: 'delete tag failed', description: 'Something went wrong', variant: 'destructive' });
        } finally {
            setDeletingId(null);
            setDeleteTarget(null);
        }
    };

    const columns = useMemo(
        () => getTagColumns({
            deletingId,
            onEdit: (tag) => {
                setDialogMode('edit');
                setDialogTag(tag);
                setDialogOpen(true);
            },
            onRequestDelete: setDeleteTarget,
        }),
        [deletingId],
    );

    return (
        <AppLayout breadcrumbs={tagConfig.breadcrumbs}>
            <Head title={tagConfig.title} />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-auto p-4 md:p-6">
                <DataTableV1
                    title={tagConfig.title}
                    columns={columns}
                    queryKey={['tags']}
                    searchPlaceholder="Search tags"
                    initialSorting={defaultTagSorting}
                    dateRangeFilter={tagDateRangeFilter}
                    actions={() => (
                        <Button
                            size="sm"
                            className="gap-2 bg-blue-600 text-white hover:bg-blue-700"
                            onClick={() => {
                        setDialogMode('create');
                        setDialogTag(null);
                        setDialogOpen(true);
                    }}
                >
                            <Plus className="size-4" />
                            Add Tag
                        </Button>
                    )}
                    queryFn={async (request) => {
                        const response = await http.get(buildTagIndexUrl(request).replace('/api', ''));

                        return normalizeTagIndexResponse(response.data);
                    }}
                />

                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <TagDialogForm mode={dialogMode} tag={dialogMode === 'edit' ? (dialogTag ?? editTag ?? null) : null} onOpenChange={setDialogOpen} />
                </Dialog>

                <Dialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Delete tag?</DialogTitle>
                            <DialogDescription>This action cannot be undone. Tag #{deleteTarget?.id} will be permanently deleted.</DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
                                Cancel
                            </Button>
                            <Button variant="destructive" disabled={!deleteTarget || deletingId === deleteTarget?.id} onClick={() => deleteTarget && void deleteTag(deleteTarget)}>
                                Delete
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
