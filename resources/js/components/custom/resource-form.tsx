import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type FormDataConvertible } from '@/lib/navigation';
import { Head, router, useForm } from '@/lib/navigation';
import { LoaderCircle, Save } from 'lucide-react';
import { FormEvent } from 'react';
import { appendFormValue, blankValues, csrfToken, valuesFromRecord } from './helpers';
import { type ResourceConfig, type ResourceRecord } from './types';

type Props = {
    config: ResourceConfig;
    mode: 'create' | 'edit';
    record?: ResourceRecord | null;
};

export function ResourceForm({ config, mode, record }: Props) {
    const fields = config.fields.filter((field) => mode === 'create' || !field.createOnly);
    const initialValues = (record ? valuesFromRecord(fields, record) : blankValues(fields)) as Record<string, FormDataConvertible>;
    const form = useForm<Record<string, FormDataConvertible>>(initialValues);
    const title = mode === 'create' ? `Create ${config.singular}` : `Edit ${config.singular}`;

    const submit = async (event: FormEvent) => {
        event.preventDefault();

        const url = mode === 'create' ? config.endpoint : `${config.endpoint}/${record?.id}`;
        const payload = new FormData();

        Object.entries(form.data).forEach(([key, value]) => appendFormValue(payload, key, value));
        if (mode === 'edit') payload.append('_method', 'PUT');

        form.clearErrors();

        const response = await fetch(url, {
            method: 'POST',
            body: payload,
            credentials: 'same-origin',
            headers: {
                Accept: 'application/json',
                'X-CSRF-TOKEN': csrfToken(),
            },
        });

        if (!response.ok) {
            const json = await response.json();
            form.setError(
                Object.fromEntries(Object.entries(json.errors ?? {}).map(([key, value]) => [key, Array.isArray(value) ? value[0] : String(value)])),
            );
            return;
        }

        router.visit(config.basePath);
    };

    return (
        <AppLayout breadcrumbs={[...config.breadcrumbs, { title, href: '#' }]}>
            <Head title={title} />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4">
                <div>
                    <h1 className="text-2xl font-semibold">{title}</h1>
                    <p className="text-sm text-muted-foreground">{config.endpoint}</p>
                </div>

                <form className="grid max-w-3xl gap-5" onSubmit={submit}>
                    {fields.map((field) => (
                        <div key={field.name} className="grid gap-2">
                            <Label htmlFor={field.name}>{field.label}</Label>
                            {field.type === 'textarea' ? (
                                <Textarea
                                    id={field.name}
                                    value={String(form.data[field.name] ?? '')}
                                    onChange={(event) => form.setData(field.name, event.target.value)}
                                />
                            ) : field.type === 'file' ? (
                                <Input id={field.name} type="file" onChange={(event) => form.setData(field.name, event.target.files?.[0] ?? null)} />
                            ) : (
                                <Input
                                    id={field.name}
                                    type={field.type}
                                    required={field.required}
                                    value={String(form.data[field.name] ?? '')}
                                    onChange={(event) => form.setData(field.name, event.target.value)}
                                />
                            )}
                            {form.errors[field.name] && <p className="text-sm text-destructive">{form.errors[field.name]}</p>}
                        </div>
                    ))}

                    <div className="flex gap-2">
                        <Button type="submit" disabled={form.processing}>
                            {form.processing ? <LoaderCircle className="mr-2 size-4 animate-spin" /> : <Save className="mr-2 size-4" />}
                            Save
                        </Button>
                        <Button type="button" variant="outline" onClick={() => router.visit(config.basePath)}>
                            Cancel
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
