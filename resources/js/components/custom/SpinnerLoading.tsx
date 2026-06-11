import { LoaderCircle } from 'lucide-react';

export function SpinnerLoading() {
    return (
        <div className="flex min-h-64 items-center justify-center">
            <LoaderCircle className="size-6 animate-spin text-muted-foreground" />
        </div>
    );
}
