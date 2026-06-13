import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@/lib/navigation';
import { Pencil } from 'lucide-react';
import { displayValue, getValue } from './helpers';
import { type ResourceConfig, type ResourceRecord } from './types';

type Props = {
    config: ResourceConfig;
    record: ResourceRecord;
};

export function ResourceShow({ config, record }: Props) {
    const title = `${config.singular} #${record.id}`;

    return (
        <AppLayout breadcrumbs={[...config.breadcrumbs, { title, href: '#' }]}>
            <Head title={title} />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold">{title}</h1>
                        <p className="text-sm text-muted-foreground">
                            {config.endpoint}/{record.id}
                        </p>
                    </div>
                    <Button asChild>
                        <Link href={`${config.basePath}/${record.id}/edit`}>
                            <Pencil className="mr-2 size-4" />
                            Edit
                        </Link>
                    </Button>
                </div>

                <div className="rounded-lg border">
                    <Table>
                        <TableBody>
                            {config.columns.map((column) => (
                                <TableRow key={column.key}>
                                    <TableCell className="w-48 font-medium">{column.label}</TableCell>
                                    <TableCell>{displayValue(getValue(record, column.key))}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </AppLayout>
    );
}
