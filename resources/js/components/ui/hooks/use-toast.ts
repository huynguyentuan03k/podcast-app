import { useSyncExternalStore } from 'react';

export type ToastVariant = 'default' | 'success' | 'info' | 'warning' | 'destructive';

export type ToastItem = {
    id: string;
    title: string;
    description?: string;
    variant?: ToastVariant;
};

type ToastInput = Omit<ToastItem, 'id'>;
type ToastTimer = {
    timeoutId: number | null;
    startedAt: number;
    remaining: number;
};
type ToastSnapshot = {
    toasts: ToastItem[];
    isPaused: boolean;
};

let toasts: ToastItem[] = [];
let isPaused = false;
let listenersReady = false;
let snapshot: ToastSnapshot = { toasts, isPaused };
const listeners = new Set<() => void>();
const timers = new Map<string, ToastTimer>();
export const TOAST_DURATION = 3600;

function emit() {
    snapshot = { toasts, isPaused };
    listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
    listeners.add(listener);

    return () => {
        listeners.delete(listener);
    };
}

function getSnapshot() {
    return snapshot;
}

function removeToast(id: string) {
    const timer = timers.get(id);

    if (timer?.timeoutId) {
        window.clearTimeout(timer.timeoutId);
    }

    timers.delete(id);
    toasts = toasts.filter((item) => item.id !== id);
    emit();
}

function startTimer(id: string, remaining: number) {
    if (typeof window === 'undefined') {
        return;
    }

    const timeoutId = window.setTimeout(() => removeToast(id), remaining);
    timers.set(id, {
        timeoutId,
        startedAt: Date.now(),
        remaining,
    });
}

function pauseToasts() {
    if (isPaused || typeof window === 'undefined') {
        return;
    }

    isPaused = true;

    timers.forEach((timer, id) => {
        if (timer.timeoutId) {
            window.clearTimeout(timer.timeoutId);
        }

        const elapsed = Date.now() - timer.startedAt;
        timers.set(id, {
            timeoutId: null,
            startedAt: timer.startedAt,
            remaining: Math.max(timer.remaining - elapsed, 0),
        });
    });

    emit();
}

function resumeToasts() {
    if (!isPaused) {
        return;
    }

    isPaused = false;

    timers.forEach((timer, id) => {
        startTimer(id, timer.remaining);
    });

    emit();
}

function setupPauseListeners() {
    if (listenersReady || typeof window === 'undefined') {
        return;
    }

    listenersReady = true;

    window.addEventListener('blur', pauseToasts);
    window.addEventListener('focus', resumeToasts);
    window.addEventListener('pointerdown', resumeToasts);
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            pauseToasts();
        } else {
            resumeToasts();
        }
    });
}

export function toast(input: ToastInput) {
    setupPauseListeners();

    const id = crypto.randomUUID();
    const removedToasts = toasts.slice(3);

    removedToasts.forEach((item) => {
        const timer = timers.get(item.id);

        if (timer?.timeoutId) {
            window.clearTimeout(timer.timeoutId);
        }

        timers.delete(item.id);
    });

    toasts = [{ id, ...input }, ...toasts].slice(0, 4);
    emit();

    if (isPaused) {
        timers.set(id, {
            timeoutId: null,
            startedAt: Date.now(),
            remaining: TOAST_DURATION,
        });
        return;
    }

    startTimer(id, TOAST_DURATION);
}

export function dismissToast(id: string) {
    removeToast(id);
}

export function useToast() {
    setupPauseListeners();

    const items = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

    return { toast, toasts: items.toasts, isPaused: items.isPaused, dismissToast };
}
