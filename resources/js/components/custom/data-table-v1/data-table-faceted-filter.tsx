import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { Filter } from 'lucide-react';
import type { DataTableV1FacetedFilterOption } from './types';

type DataTableFacetedFilterProps = {
    title: string;
    options: DataTableV1FacetedFilterOption[];
    value: string[];
    onChange: (value: string[]) => void;
};

export function DataTableFacetedFilter({ title, options, value, onChange }: DataTableFacetedFilterProps) {
    const selected = new Set(value);

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
                <Button variant="outline" size="sm" className="h-9 gap-2">
                    <Filter className="size-4" />
                    {title}
                    {value.length ? (
                        <Badge variant="secondary" className="ml-1 h-5 rounded-sm px-1.5">
                            {value.length}
                        </Badge>
                    ) : null}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-44">
                <DropdownMenuLabel className="text-muted-foreground">Filters</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {options.map((option) => (
                    <DropdownMenuCheckboxItem
                        key={option.value}
                        checked={selected.has(option.value)}
                        onCheckedChange={() => toggleValue(option.value)}
                        onSelect={(event) => event.preventDefault()}
                        className="cursor-pointer"
                    >
                        <span className="flex-1">{option.label}</span>
                        {typeof option.count === 'number' ? (
                            <span className={cn('ml-auto text-xs text-muted-foreground', selected.has(option.value) && 'text-foreground')}>
                                {option.count}
                            </span>
                        ) : null}
                    </DropdownMenuCheckboxItem>
                ))}
                {value.length ? (
                    <>
                        <DropdownMenuSeparator />
                        <Button variant="ghost" size="sm" className="h-8 w-full justify-center" onClick={() => onChange([])}>
                            Clear
                        </Button>
                    </>
                ) : null}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
