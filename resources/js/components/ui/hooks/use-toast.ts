import { useSyncExternalStore } from 'react';

export type ToastVariant = 'default' | 'destructive';

export type ToastItem = {
    id: string;
    title: string;
    description?: string;
    variant?: ToastVariant;
};

type ToastInput = Omit<ToastItem, 'id'>;

let toasts: ToastItem[] = [];
const listeners = new Set<() => void>();

function emit() {
    listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
    listeners.add(listener);

    return () => {
        listeners.delete(listener);
    };
}

function getSnapshot() {
    return toasts;
}

export function toast(input: ToastInput) {
    const id = crypto.randomUUID();

    toasts = [{ id, ...input }, ...toasts].slice(0, 4);
    emit();

    window.setTimeout(() => {
        toasts = toasts.filter((item) => item.id !== id);
        emit();
    }, 3600);
}

export function dismissToast(id: string) {
    toasts = toasts.filter((item) => item.id !== id);
    emit();
}

export function useToast() {
    const items = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

    return { toast, toasts: items, dismissToast };
}
