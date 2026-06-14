import { TOAST_DURATION, useToast, type ToastVariant } from '@/components/ui/hooks/use-toast';
import { cn } from '@/lib/utils';
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react';

const toastStyles: Record<ToastVariant, { className: string; progressClassName: string; icon: typeof Info }> = {
    default: {
        className: 'bg-[#05b927] text-white shadow-[0_14px_30px_rgba(5,185,39,0.28)]',
        progressClassName: 'bg-white/75',
        icon: CheckCircle2,
    },
    success: {
        className: 'bg-[#05b927] text-white shadow-[0_14px_30px_rgba(5,185,39,0.28)]',
        progressClassName: 'bg-white/75',
        icon: CheckCircle2,
    },
    info: {
        className: 'bg-[#3498db] text-white shadow-[0_14px_30px_rgba(52,152,219,0.28)]',
        progressClassName: 'bg-white/75',
        icon: Info,
    },
    warning: {
        className: 'bg-[#f1c40f] text-white shadow-[0_14px_30px_rgba(241,196,15,0.28)]',
        progressClassName: 'bg-white/75',
        icon: AlertTriangle,
    },
    destructive: {
        className: 'bg-[#f04438] text-white shadow-[0_14px_30px_rgba(240,68,56,0.28)]',
        progressClassName: 'bg-white/75',
        icon: XCircle,
    },
};

export function Toaster() {
    const { toasts, isPaused, dismissToast } = useToast();

    return (
        <div className="fixed right-4 bottom-4 z-50 flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-2">
            {toasts.map((item) => {
                const style = toastStyles[item.variant ?? 'default'];
                const Icon = style.icon;

                return (
                    <div
                        key={item.id}
                        className={cn(
                            'relative overflow-hidden rounded-md px-4 py-3',
                            'data-[state=open]:animate-in data-[state=open]:slide-in-from-right-4 data-[state=open]:fade-in-0',
                            style.className,
                        )}
                        data-state="open"
                    >
                        <div className="flex items-start gap-3 pr-7">
                            <Icon className="mt-0.5 size-5 shrink-0 fill-white/20 text-white" />
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-semibold leading-5">{item.title}</p>
                                {item.description ? <p className="mt-1 text-sm leading-5 text-white/90">{item.description}</p> : null}
                            </div>
                        </div>
                        <button
                            type="button"
                            className="absolute top-2.5 right-2.5 inline-flex size-6 items-center justify-center rounded-sm text-white/80 transition hover:bg-white/15 hover:text-white"
                            onClick={() => dismissToast(item.id)}
                        >
                            <X className="size-4" />
                            <span className="sr-only">Dismiss toast</span>
                        </button>
                        <span
                            className={cn('absolute bottom-0 left-0 h-1 w-full origin-left animate-toast-progress', style.progressClassName)}
                            style={{ animationDuration: `${TOAST_DURATION}ms`, animationPlayState: isPaused ? 'paused' : 'running' }}
                        />
                    </div>
                );
            })}
        </div>
    );
}
