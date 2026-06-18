import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Check, ChevronDown, Search, X } from 'lucide-react';
import { useMemo, useState } from 'react';

export type MultipleSelectOption = {
    value: number;
    label: string;
};

type BaseSelectProps = {
    options: MultipleSelectOption[];
    placeholder?: string;
    searchPlaceholder?: string;
    emptyText?: string;
};

type MultipleModeProps = BaseSelectProps & {
    selectionMode?: 'multiple';
    value: number[];
    onChange: (value: number[]) => void;
};

type SingleModeProps = BaseSelectProps & {
    selectionMode: 'single';
    value: number | null;
    onChange: (value: number | null) => void;
};

type MultipleSelectProps = MultipleModeProps | SingleModeProps;

export function MultipleSelect({
    options,
    value,
    onChange,
    placeholder = 'Select...',
    searchPlaceholder = 'Search...',
    emptyText = 'No options found.',
    selectionMode = 'multiple',
}: MultipleSelectProps) {
    const [search, setSearch] = useState('');
    const isSingle = selectionMode === 'single';

    const selectedValues = useMemo<number[]>(() => {
        if (isSingle) {
            const singleValue = value as SingleModeProps['value'];

            return singleValue == null ? [] : [singleValue];
        }

        return value as MultipleModeProps['value'];
    }, [isSingle, value]);

    const selectedOptions = useMemo(() => options.filter((option) => selectedValues.includes(option.value)), [options, selectedValues]);

    const filteredOptions = useMemo(() => {
        const searchValue = search.trim().toLowerCase();

        if (!searchValue) {
            return options;
        }

        return options.filter((option) => option.label.toLowerCase().includes(searchValue));
    }, [options, search]);

    const updateValue = (nextValues: number[]) => {
        if (isSingle) {
            onChange((nextValues[0] ?? null) as never);
            return;
        }

        onChange(nextValues as never);
    };

    const toggleValue = (optionValue: number) => {
        if (isSingle) {
            updateValue(selectedValues.includes(optionValue) ? [] : [optionValue]);
            return;
        }

        updateValue(selectedValues.includes(optionValue) ? selectedValues.filter((currentValue) => currentValue !== optionValue) : [...selectedValues, optionValue]);
    };

    const removeValue = (optionValue: number) => {
        updateValue(selectedValues.filter((currentValue) => currentValue !== optionValue));
    };

    const triggerLabel = useMemo(() => {
        if (!selectedOptions.length) {
            return placeholder;
        }

        if (isSingle) {
            return selectedOptions[0]?.label ?? placeholder;
        }

        return `${selectedOptions.length} selected`;
    }, [isSingle, placeholder, selectedOptions]);

    return (
        <div className="space-y-2">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="h-10 w-full justify-between px-3 font-normal">
                        <span className="line-clamp-1 text-left text-muted-foreground">{triggerLabel}</span>
                        <ChevronDown className="size-4 opacity-60" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-[var(--radix-dropdown-menu-trigger-width)] p-2">
                    <div className="relative mb-2">
                        <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={searchPlaceholder} className="h-9 pl-8" />
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                        {filteredOptions.length ? (
                            filteredOptions.map((option) => {
                                const checked = selectedValues.includes(option.value);

                                return (
                                    <button
                                        key={option.value}
                                        type="button"
                                        className="flex h-9 w-full cursor-pointer items-center gap-2 rounded-md px-2 text-left text-sm hover:bg-accent"
                                        onClick={() => toggleValue(option.value)}
                                    >
                                        {isSingle ? (
                                            <span className="flex size-4 items-center justify-center rounded-sm border">
                                                {checked ? <Check className="size-3" /> : null}
                                            </span>
                                        ) : (
                                            <Checkbox checked={checked} aria-label={option.label} className="size-4" />
                                        )}
                                        <span className="line-clamp-1 flex-1">{option.label}</span>
                                    </button>
                                );
                            })
                        ) : (
                            <p className="px-2 py-3 text-sm text-muted-foreground">{emptyText}</p>
                        )}
                    </div>
                </DropdownMenuContent>
            </DropdownMenu>
            {selectedOptions.length ? (
                <div className="flex flex-wrap gap-2">
                    {selectedOptions.map((option) => (
                        <Badge key={option.value} variant="secondary" className="gap-1">
                            {option.label}
                            <button type="button" onClick={() => removeValue(option.value)}>
                                <X className="size-3" />
                            </button>
                        </Badge>
                    ))}
                </div>
            ) : null}
        </div>
    );
}
