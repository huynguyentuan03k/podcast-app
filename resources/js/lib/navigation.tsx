import { useCallback, useMemo, useState, type MouseEvent, type ReactNode } from 'react';

export type FormDataConvertible = string | number | boolean | Blob | File | null | undefined;

type VisitOptions = {
    onFinish?: () => void;
    onSuccess?: () => void;
    onError?: (errors: Record<string, string>) => void;
    preserveScroll?: boolean;
};

type FormErrors<T> = Partial<Record<keyof T | string, string>>;

type LinkProps = {
    href: string;
    method?: 'get' | 'post' | 'put' | 'patch' | 'delete';
    as?: 'a' | 'button';
    prefetch?: boolean;
    className?: string;
    children?: ReactNode;
    onClick?: (event: MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => void;
    [key: string]: unknown;
};

const csrfToken = () => document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ?? '';

function setTitle(title?: string) {
    if (title) {
        document.title = title;
    }
}

export function Head({ title, children }: { title?: string; children?: ReactNode }) {
    setTitle(title);
    return <>{children ?? null}</>;
}

export function Link({ href, method = 'get', as, children, onClick, ...props }: LinkProps) {
    const submit = (event: MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => {
        onClick?.(event);
        if (event.defaultPrevented) {
            return;
        }

        if (method === 'get') {
            return;
        }

        event.preventDefault();
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = href;

        const token = document.createElement('input');
        token.type = 'hidden';
        token.name = '_token';
        token.value = csrfToken();
        form.appendChild(token);

        if (method !== 'post') {
            const spoof = document.createElement('input');
            spoof.type = 'hidden';
            spoof.name = '_method';
            spoof.value = method.toUpperCase();
            form.appendChild(spoof);
        }

        document.body.appendChild(form);
        form.submit();
    };

    if (as === 'button' || method !== 'get') {
        return (
            <button type="button" {...props} onClick={submit}>
                {children}
            </button>
        );
    }

    return (
        <a href={href} {...props} onClick={submit}>
            {children}
        </a>
    );
}

export const router = {
    visit(url: string) {
        window.location.assign(url);
    },
};

function encodeFormData<T extends Record<string, unknown>>(data: T) {
    const payload = new FormData();

    Object.entries(data).forEach(([key, value]) => {
        if (value === null || value === undefined) {
            return;
        }

        payload.append(key, value instanceof Blob ? value : String(value));
    });

    return payload;
}

export function useForm<T extends Record<string, unknown>>(initialData: T) {
    const [data, updateData] = useState<T>(initialData);
    const [errors, setErrors] = useState<FormErrors<T>>({});
    const [processing, setProcessing] = useState(false);
    const [recentlySuccessful, setRecentlySuccessful] = useState(false);

    const setData = useCallback(
        <K extends keyof T>(key: K | Partial<T>, value?: T[K]) => {
            updateData((current) => (typeof key === 'object' ? { ...current, ...key } : { ...current, [key]: value }));
        },
        [],
    );

    const reset = useCallback((...keys: (keyof T)[]) => {
        updateData((current) => {
            if (keys.length === 0) {
                return initialData;
            }

            return keys.reduce((next, key) => ({ ...next, [key]: initialData[key] }), current);
        });
    }, [initialData]);

    const clearErrors = useCallback(() => setErrors({}), []);
    const setError = useCallback((nextErrors: FormErrors<T>) => setErrors(nextErrors), []);

    const submit = useCallback(
        async (method: string, url: string, options: VisitOptions = {}) => {
            setProcessing(true);
            setRecentlySuccessful(false);
            setErrors({});

            const payload = encodeFormData(data);
            if (!['GET', 'POST'].includes(method.toUpperCase())) {
                payload.append('_method', method.toUpperCase());
            }

            const response = await fetch(url, {
                method: method.toUpperCase() === 'GET' ? 'GET' : 'POST',
                body: method.toUpperCase() === 'GET' ? undefined : payload,
                credentials: 'same-origin',
                headers: {
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': csrfToken(),
                },
            });

            if (response.ok) {
                setRecentlySuccessful(true);
                options.onSuccess?.();
            } else if (response.headers.get('content-type')?.includes('application/json')) {
                const json = await response.json();
                const nextErrors = Object.fromEntries(
                    Object.entries(json.errors ?? {}).map(([key, value]) => [key, Array.isArray(value) ? value[0] : String(value)]),
                ) as Record<string, string>;
                setErrors(nextErrors as FormErrors<T>);
                options.onError?.(nextErrors);
            }

            setProcessing(false);
            options.onFinish?.();
        },
        [data],
    );

    return useMemo(
        () => ({
            data,
            setData,
            errors,
            processing,
            recentlySuccessful,
            reset,
            clearErrors,
            setError,
            post: (url: string, options?: VisitOptions) => submit('POST', url, options),
            put: (url: string, options?: VisitOptions) => submit('PUT', url, options),
            patch: (url: string, options?: VisitOptions) => submit('PATCH', url, options),
            delete: (url: string, options?: VisitOptions) => submit('DELETE', url, options),
        }),
        [clearErrors, data, errors, processing, recentlySuccessful, reset, setData, setError, submit],
    );
}

export function usePage<T extends { [key: string]: unknown }>() {
    return {
        props: {
            name: document.title || 'Podcast App',
            quote: null,
            auth: {},
            sidebarOpen: true,
        } as unknown as T,
        url: window.location.pathname,
    };
}
