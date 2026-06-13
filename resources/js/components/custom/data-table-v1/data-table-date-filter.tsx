import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { CalendarDays, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import type { DataTableV1DateRange } from './types';

type DataTableDateFilterProps = {
    title: string;
    value: DataTableV1DateRange;
    onChange: (value: DataTableV1DateRange) => void;
};

type Preset = {
    label: string;
    getRange: () => Required<DataTableV1DateRange>;
};

const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const shortMonthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

function startOfDay(date: Date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date: Date, days: number) {
    const next = new Date(date);
    next.setDate(next.getDate() + days);
    return next;
}

function addMonths(date: Date, months: number) {
    return new Date(date.getFullYear(), date.getMonth() + months, 1);
}

function toDateKey(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

function fromDateKey(value?: string) {
    if (!value) {
        return undefined;
    }

    const [year, month, day] = value.split('-').map(Number);

    if (!year || !month || !day) {
        return undefined;
    }

    return new Date(year, month - 1, day);
}

function formatDateKey(value?: string) {
    const date = fromDateKey(value);

    if (!date) {
        return '';
    }

    return `${String(date.getDate()).padStart(2, '0')} ${shortMonthNames[date.getMonth()]}, ${date.getFullYear()}`;
}

function normalizeRange(from: string, to?: string): Required<DataTableV1DateRange> {
    if (!to) {
        return { from, to: from };
    }

    return from <= to ? { from, to } : { from: to, to: from };
}

function getPresetRanges(): Preset[] {
    const today = startOfDay(new Date());
    const weekStart = addDays(today, -today.getDay());
    const lastWeekStart = addDays(weekStart, -7);
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const yearStart = new Date(today.getFullYear(), 0, 1);
    const lastYearStart = new Date(today.getFullYear() - 1, 0, 1);

    return [
        { label: 'Today', getRange: () => ({ from: toDateKey(today), to: toDateKey(today) }) },
        { label: 'Yesterday', getRange: () => ({ from: toDateKey(addDays(today, -1)), to: toDateKey(addDays(today, -1)) }) },
        { label: 'This Week', getRange: () => ({ from: toDateKey(weekStart), to: toDateKey(addDays(weekStart, 6)) }) },
        { label: 'Last Week', getRange: () => ({ from: toDateKey(lastWeekStart), to: toDateKey(addDays(lastWeekStart, 6)) }) },
        { label: 'Last 7 Days', getRange: () => ({ from: toDateKey(addDays(today, -6)), to: toDateKey(today) }) },
        { label: 'This Month', getRange: () => ({ from: toDateKey(monthStart), to: toDateKey(new Date(today.getFullYear(), today.getMonth() + 1, 0)) }) },
        {
            label: 'Last Month',
            getRange: () => ({ from: toDateKey(lastMonthStart), to: toDateKey(new Date(today.getFullYear(), today.getMonth(), 0)) }),
        },
        { label: 'This Year', getRange: () => ({ from: toDateKey(yearStart), to: toDateKey(new Date(today.getFullYear(), 11, 31)) }) },
        { label: 'Last Year', getRange: () => ({ from: toDateKey(lastYearStart), to: toDateKey(new Date(today.getFullYear() - 1, 11, 31)) }) },
    ];
}

function MonthSelect({ value, onChange }: { value: number; onChange: (value: number) => void }) {
    return (
        <Select value={String(value)} onValueChange={(nextValue) => onChange(Number(nextValue))}>
            <SelectTrigger className="h-9 w-32">
                <SelectValue />
            </SelectTrigger>
            <SelectContent>
                {monthNames.map((month, index) => (
                    <SelectItem key={month} value={String(index)}>
                        {month}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}

function YearSelect({ value, onChange }: { value: number; onChange: (value: number) => void }) {
    const years = useMemo(() => {
        const currentYear = new Date().getFullYear();

        return Array.from({ length: 15 }, (_, index) => currentYear - 10 + index);
    }, []);

    return (
        <Select value={String(value)} onValueChange={(nextValue) => onChange(Number(nextValue))}>
            <SelectTrigger className="h-9 w-28">
                <SelectValue />
            </SelectTrigger>
            <SelectContent>
                {years.map((year) => (
                    <SelectItem key={year} value={String(year)}>
                        {year}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}

function CalendarMonth({
    month,
    range,
    onSelect,
}: {
    month: Date;
    range: DataTableV1DateRange;
    onSelect: (value: string) => void;
}) {
    const days = useMemo(() => {
        const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
        const lastDay = new Date(month.getFullYear(), month.getMonth() + 1, 0);
        const leadingBlankDays = Array.from({ length: firstDay.getDay() }, () => null);
        const monthDays = Array.from({ length: lastDay.getDate() }, (_, index) => new Date(month.getFullYear(), month.getMonth(), index + 1));

        return [...leadingBlankDays, ...monthDays];
    }, [month]);

    return (
        <div className="w-56 space-y-3">
            <p className="text-center text-sm font-medium">
                {monthNames[month.getMonth()]} {month.getFullYear()}
            </p>
            <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground">
                {weekDays.map((day) => (
                    <span key={day}>{day}</span>
                ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
                {days.map((day, index) => {
                    if (!day) {
                        return <span key={`blank-${index}`} className="size-8" />;
                    }

                    const key = toDateKey(day);
                    const isStart = range.from === key;
                    const isEnd = range.to === key;
                    const isBetween = Boolean(range.from && range.to && key > range.from && key < range.to);

                    return (
                        <Button
                            key={key}
                            type="button"
                            variant="ghost"
                            size="icon"
                            className={cn(
                                'size-8 rounded-md font-normal',
                                isBetween && 'bg-accent',
                                (isStart || isEnd) && 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground',
                            )}
                            onClick={() => onSelect(key)}
                        >
                            {day.getDate()}
                        </Button>
                    );
                })}
            </div>
        </div>
    );
}

export function DataTableDateFilter({ title, value, onChange }: DataTableDateFilterProps) {
    const selectedStart = fromDateKey(value.from);
    const selectedEnd = fromDateKey(value.to);
    const initialMonth = selectedStart ? new Date(selectedStart.getFullYear(), selectedStart.getMonth(), 1) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const initialRightMonth = selectedEnd ? new Date(selectedEnd.getFullYear(), selectedEnd.getMonth(), 1) : addMonths(initialMonth, 1);
    const [leftMonth, setLeftMonth] = useState(initialMonth);
    const [rightMonth, setRightMonth] = useState(initialRightMonth);
    const [draftRange, setDraftRange] = useState<DataTableV1DateRange>(value);
    const presets = useMemo(() => getPresetRanges(), []);
    const hasValue = Boolean(value.from || value.to);
    const label = hasValue ? `${formatDateKey(value.from)} - ${formatDateKey(value.to ?? value.from)}` : title;

    useEffect(() => {
        setDraftRange(value);
    }, [value]);

    const updateLeftMonth = (month: number, year = leftMonth.getFullYear()) => {
        setLeftMonth(new Date(year, month, 1));
    };

    const updateRightMonth = (month: number, year = rightMonth.getFullYear()) => {
        setRightMonth(new Date(year, month, 1));
    };

    const commitRange = (next: DataTableV1DateRange) => {
        setDraftRange(next);
        onChange(next);
    };

    const selectDay = (day: string) => {
        if (!draftRange.from || (draftRange.from && draftRange.to)) {
            commitRange({ from: day });
            return;
        }

        commitRange(normalizeRange(draftRange.from, day));
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 gap-2">
                    <CalendarDays className="size-4" />
                    {label}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[43rem] p-0">
                <div className="flex">
                    <div className="w-36 space-y-1 p-4">
                        {presets.map((preset) => (
                            <Button
                                key={preset.label}
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-9 w-full justify-start"
                                onClick={() => {
                                    const next = preset.getRange();
                                    const nextDate = fromDateKey(next.from);
                                    const nextEndDate = fromDateKey(next.to);

                                    if (nextDate) {
                                        const nextLeftMonth = new Date(nextDate.getFullYear(), nextDate.getMonth(), 1);
                                        const nextRightMonth = nextEndDate
                                            ? new Date(nextEndDate.getFullYear(), nextEndDate.getMonth(), 1)
                                            : addMonths(nextLeftMonth, 1);

                                        setLeftMonth(nextLeftMonth);
                                        setRightMonth(nextRightMonth <= nextLeftMonth ? addMonths(nextLeftMonth, 1) : nextRightMonth);
                                    }

                                    commitRange(next);
                                }}
                            >
                                {preset.label}
                            </Button>
                        ))}
                    </div>
                    <Separator orientation="vertical" />
                    <div className="flex-1 space-y-4 p-4">
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                                <MonthSelect value={leftMonth.getMonth()} onChange={(month) => updateLeftMonth(month)} />
                                <YearSelect value={leftMonth.getFullYear()} onChange={(year) => updateLeftMonth(leftMonth.getMonth(), year)} />
                            </div>
                            <div className="flex items-center gap-2">
                                <MonthSelect value={rightMonth.getMonth()} onChange={(month) => updateRightMonth(month)} />
                                <YearSelect value={rightMonth.getFullYear()} onChange={(year) => updateRightMonth(rightMonth.getMonth(), year)} />
                            </div>
                            <div className="flex items-center gap-1">
                                {hasValue ? (
                                    <Button type="button" variant="ghost" size="sm" className="gap-1" onClick={() => commitRange({})}>
                                        Reset
                                        <X className="size-4" />
                                    </Button>
                                ) : null}
                            </div>
                        </div>
                        <div className="flex gap-5">
                            <CalendarMonth month={leftMonth} range={draftRange} onSelect={selectDay} />
                            <CalendarMonth month={rightMonth} range={draftRange} onSelect={selectDay} />
                        </div>
                    </div>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
