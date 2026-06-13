import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

type DataTableSkeletonProps = {
    columns: number;
    rows?: number;
};

export function DataTableSkeleton({ columns, rows = 10 }: DataTableSkeletonProps) {
    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        {Array.from({ length: columns }).map((_, index) => (
                            <TableHead key={index}>
                                <Skeleton className="h-4 w-24" />
                            </TableHead>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {Array.from({ length: rows }).map((_, rowIndex) => (
                        <TableRow key={rowIndex}>
                            {Array.from({ length: columns }).map((_, columnIndex) => (
                                <TableCell key={columnIndex}>
                                    <Skeleton className="h-4 w-full max-w-40" />
                                </TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
