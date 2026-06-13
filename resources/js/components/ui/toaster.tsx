import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/hooks/use-toast';
import { cn } from '@/lib/utils';
import { CheckCircle2, X, XCircle } from 'lucide-react';

export function Toaster() {
    const { toasts, dismissToast } = useToast();

    return (
        <div className="fixed right-4 bottom-4 z-50 flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-2">
            {toasts.map((item) => {
                const destructive = item.variant === 'destructive';
                const Icon = destructive ? XCircle : CheckCircle2;

                return (
                    <div
                        key={item.id}
                        className={cn(
                            'flex items-start gap-3 rounded-lg border p-4 shadow-lg backdrop-blur-sm',
                            destructive
                                ? 'border-red-200 bg-red-50 text-red-950 dark:border-red-900/60 dark:bg-red-950/90 dark:text-red-50'
                                : 'border-emerald-200 bg-emerald-50 text-emerald-950 dark:border-emerald-900/60 dark:bg-emerald-950/90 dark:text-emerald-50',
                        )}
                    >
                        <Icon className={cn('mt-0.5 size-5 shrink-0', destructive ? 'text-red-600 dark:text-red-300' : 'text-emerald-600 dark:text-emerald-300')} />
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold">{item.title}</p>
                            {item.description ? <p className="mt-1 text-sm opacity-80">{item.description}</p> : null}
                        </div>
                        <Button variant="ghost" size="icon" className="size-7 shrink-0" onClick={() => dismissToast(item.id)}>
                            <X className="size-4" />
                            <span className="sr-only">Dismiss toast</span>
                        </Button>
                    </div>
                );
            })}
        </div>
    );
}
