import { type ResourceField, type ResourceRecord } from './types';

export function getValue(source: unknown, path: string): unknown {
    if (!source || typeof source !== 'object') return undefined;

    return path.split('.').reduce<unknown>((acc, part) => {
        if (!acc || typeof acc !== 'object') return undefined;
        return (acc as Record<string, unknown>)[part];
    }, source);
}

export function displayValue(value: unknown): string {
    if (value === null || value === undefined) return '';
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return String(value);
    if (Array.isArray(value)) return value.map(displayValue).filter(Boolean).join(', ');
    return '';
}

export function blankValues(fields: ResourceField[]): Record<string, unknown> {
    return Object.fromEntries(fields.map((field) => [field.name, field.type === 'file' ? null : '']));
}

export function valuesFromRecord(fields: ResourceField[], record: ResourceRecord): Record<string, unknown> {
    const values = blankValues(fields);

    fields.forEach((field) => {
        if (field.type === 'file') return;
        values[field.name] = getValue(record, field.name) ?? '';
    });

    return values;
}

export function appendFormValue(payload: FormData, key: string, value: unknown): void {
    if (value === null || value === undefined || value === '') return;

    const normalizedKey = key.replace(/\.(\w+)/g, '[$1]');

    if (Array.isArray(value)) {
        value.forEach((item) => appendFormValue(payload, `${normalizedKey}[]`, item));
        return;
    }

    payload.append(normalizedKey, value as string | Blob);
}

export function csrfToken(): string {
    return (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content ?? '';
}
