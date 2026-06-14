import { Button } from '@/components/ui/button';
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/hooks/use-toast';
import http from '@/http/client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { LoaderCircle, Save } from 'lucide-react';
import { useMemo } from 'react';
import { useForm, type Resolver } from 'react-hook-form';
import { tagConfig, TagFormSchema, type Tag, type TagForm } from '../shema';

type LaravelValidationError = {
    message?: string;
    errors?: Record<string, string[]>;
};

type Props = {
    mode: 'create' | 'edit';
    tag?: Tag | null;
    onOpenChange: (open: boolean) => void;
};

function applyLaravelErrors(form: ReturnType<typeof useForm<TagForm>>, error: AxiosError<LaravelValidationError>) {
    Object.entries(error.response?.data?.errors ?? {}).forEach(([field, messages]) => {
        form.setError(field as keyof TagForm, {
            type: 'server',
            message: messages[0] ?? 'Invalid value.',
        });
    });
}

export default function TagDialogForm({ mode, tag, onOpenChange }: Props) {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const defaultValues = useMemo<TagForm>(
        () => ({
            name: tag?.name ?? '',
        }),
        [tag],
    );

    const form = useForm<TagForm>({
        resolver: zodResolver(TagFormSchema) as Resolver<TagForm>,
        values: defaultValues,
    });

    const mutation = useMutation({
        mutationFn: async (values: TagForm) => {
            const endpoint = tagConfig.endpoint.replace('/api', '');

            return mode === 'create'
                ? http.post(endpoint, values)
                : http.put(`${endpoint}/${tag?.id}`, values);
        },
        onSuccess: async () => {
            toast({
                title: mode === 'create' ? 'create tag successfully' : 'update tag successfully',
                description: mode === 'create' ? 'tag has been store.' : 'tag has been updated.',
            });
            await queryClient.invalidateQueries({ queryKey: ['tags'] });
            onOpenChange(false);
        },
        onError: (error: AxiosError<LaravelValidationError>) => {
            toast({
                title: mode === 'create' ? 'create tag failed' : 'update tag failed',
                description: error.response?.data?.message || 'Something went wrong',
                variant: 'destructive',
            });
            applyLaravelErrors(form, error);
        },
    });

    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>{mode === 'create' ? 'Create Tag' : 'Edit Tag'}</DialogTitle>
                <DialogDescription>{mode === 'create' ? 'Add a new tag.' : 'Update the selected tag.'}</DialogDescription>
            </DialogHeader>

            <Form {...form}>
                <form id="tag-dialog-form" onSubmit={form.handleSubmit((values) => mutation.mutate(values))} className="space-y-5">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Name <span className="text-destructive">*</span>
                                </FormLabel>
                                <FormControl>
                                    <Input placeholder="Tag name" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={mutation.isPending} className="gap-2 bg-blue-600 text-white hover:bg-blue-700">
                            {mutation.isPending ? <LoaderCircle className="size-4 animate-spin" /> : <Save className="size-4" />}
                            Save
                        </Button>
                    </DialogFooter>
                </form>
            </Form>
        </DialogContent>
    );
}
