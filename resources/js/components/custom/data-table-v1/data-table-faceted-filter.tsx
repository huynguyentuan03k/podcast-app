import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { CirclePlus, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { DataTableV1FacetedFilterOption } from './types';

type DataTableFacetedFilterProps = {
    title: string;
    options: DataTableV1FacetedFilterOption[];
    value: string[];
    onChange: (value: string[]) => void;
    searchPlaceholder?: string;
};

export function DataTableFacetedFilter({ title, options, value, onChange, searchPlaceholder }: DataTableFacetedFilterProps) {
    const [search, setSearch] = useState('');
    const selected = new Set(value);
    const filteredOptions = useMemo(() => {
        const searchValue = search.trim().toLowerCase();

        if (!searchValue) {
            return options;
        }

        return options.filter((option) => option.label.toLowerCase().includes(searchValue));
    }, [options, search]);

    const toggleValue = (optionValue: string) => {
        const next = new Set(selected);

        if (next.has(optionValue)) {
            next.delete(optionValue);
        } else {
            next.add(optionValue);
        }

        onChange(Array.from(next));
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className={cn('h-8 gap-1.5 rounded-md border-dashed px-2.5', value.length && 'border-solid')}>
                    <CirclePlus className="size-4" />
                    {title}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56 rounded-lg p-2">
                <div className="relative mb-2">
                    <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder={searchPlaceholder ?? title}
                        className="h-9 rounded-md pl-8"
                    />
                </div>
                {filteredOptions.length ? (
                    filteredOptions.map((option) => (
                        <button
                            key={option.value}
                            type="button"
                            className="flex h-9 w-full cursor-pointer items-center gap-2 rounded-md px-1.5 text-left text-sm hover:bg-accent"
                            onClick={() => toggleValue(option.value)}
                        >
                            <Checkbox checked={selected.has(option.value)} aria-label={option.label} className="size-4" />
                            <span className="flex-1 truncate font-medium">{option.label}</span>
                            {typeof option.count === 'number' ? (
                                <span className="ml-auto text-xs font-semibold text-foreground">{option.count}</span>
                            ) : null}
                        </button>
                    ))
                ) : (
                    <DropdownMenuLabel className="py-3 text-center text-sm font-normal text-muted-foreground">No results.</DropdownMenuLabel>
                )}
                {value.length ? (
                    <Button variant="ghost" size="sm" className="mt-1 h-8 w-full justify-center" onClick={() => onChange([])}>
                        Clear
                    </Button>
                ) : null}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
