import { cn } from '@/lib/utils';
import { useCallback, useEffect, useSyncExternalStore, type AnchorHTMLAttributes, type ReactNode } from 'react';
import { useLocation, useNavigate, type NavigateOptions, type To } from 'react-router-dom';

type PageTransitionProps = {
    children: ReactNode;
    className?: string;
};

type TransitionLinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & {
    href: To;
    replace?: boolean;
    state?: unknown;
};

const listeners = new Set<() => void>();
let isNavigationLoading = false;
let loadingTimeout: number | null = null;

function emitNavigationLoadingChange() {
    listeners.forEach((listener) => listener());
}

function setNavigationLoading(value: boolean) {
    isNavigationLoading = value;
    emitNavigationLoadingChange();
}

export function startNavigationLoading() {
    if (loadingTimeout) {
        window.clearTimeout(loadingTimeout);
        loadingTimeout = null;
    }

    setNavigationLoading(true);
}

export function stopNavigationLoading(delay = 360) {
    if (loadingTimeout) {
        window.clearTimeout(loadingTimeout);
    }

    loadingTimeout = window.setTimeout(() => {
        setNavigationLoading(false);
        loadingTimeout = null;
    }, delay);
}

function subscribeNavigationLoading(listener: () => void) {
    listeners.add(listener);

    return () => listeners.delete(listener);
}

function getNavigationLoadingSnapshot() {
    return isNavigationLoading;
}

export function useLoadingNavigate() {
    const navigate = useNavigate();

    return useCallback(
        (to: To | number, options?: NavigateOptions) => {
            startNavigationLoading();

            window.requestAnimationFrame(() => {
                if (typeof to === 'number') {
                    navigate(to);
                    return;
                }

                navigate(to, options);
            });
        },
        [navigate],
    );
}

export function TransitionLink({ href, replace, state, onClick, children, ...props }: TransitionLinkProps) {
    const navigateWithLoading = useLoadingNavigate();

    return (
        <a
            {...props}
            href={typeof href === 'string' ? href : undefined}
            onClick={(event) => {
                onClick?.(event);

                if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.altKey || event.ctrlKey || event.shiftKey) {
                    return;
                }

                event.preventDefault();
                navigateWithLoading(href, { replace, state });
            }}
        >
            {children}
        </a>
    );
}

export function NavigationLoadingOverlay() {
    const location = useLocation();
    const isLoading = useSyncExternalStore(subscribeNavigationLoading, getNavigationLoadingSnapshot, getNavigationLoadingSnapshot);

    useEffect(() => {
        if (isLoading) {
            stopNavigationLoading();
        }
    }, [isLoading, location.key]);

    if (!isLoading) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-[9999] grid place-items-center bg-background/60 backdrop-blur-[1px]">
            <div className="navigation-loading-spinner" aria-label="Loading" role="status" />
        </div>
    );
}

export function PageTransition({ children, className }: PageTransitionProps) {
    return <div className={cn(className)}>{children}</div>;
}
