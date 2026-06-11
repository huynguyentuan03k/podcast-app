import * as React from 'react';
import * as RechartsPrimitive from 'recharts';

import { cn } from '@/lib/utils';

const ChartContext = React.createContext<{
    config: ChartConfig;
} | null>(null);

type ChartConfig = Record<
    string,
    {
        label?: string;
        icon?: React.ComponentType;
        color?: string;
    }
>;

type ChartPayloadItem = {
    dataKey?: string;
    name?: string;
    value?: unknown;
    color?: string;
};

type ChartLegendItem = {
    dataKey?: string;
    value?: string;
    color?: string;
};

function useChart() {
    const context = React.useContext(ChartContext);

    if (!context) {
        throw new Error('useChart must be used within a ChartContainer');
    }

    return context;
}

function ChartContainer({
    config,
    className,
    children,
}: React.ComponentProps<'div'> & {
    config: ChartConfig;
    children: React.ComponentProps<typeof RechartsPrimitive.ResponsiveContainer>['children'];
}) {
    const colors = Object.entries(config).reduce<Record<string, string>>((acc, [key, value]) => {
        if (value.color) {
            acc[`--color-${key}`] = value.color;
        }

        return acc;
    }, {});

    return (
        <ChartContext.Provider value={{ config }}>
            <div
                data-slot="chart"
                style={colors}
                className={cn(
                    '[&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke="#ccc"]]:stroke-border/60 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-dot[stroke="#fff"]]:stroke-transparent [&_.recharts-layer]:outline-hidden [&_.recharts-polar-grid_[stroke="#ccc"]]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line_[stroke="#ccc"]]:stroke-border flex aspect-video justify-center text-xs',
                    className,
                )}
            >
                <RechartsPrimitive.ResponsiveContainer>{children}</RechartsPrimitive.ResponsiveContainer>
            </div>
        </ChartContext.Provider>
    );
}

function ChartTooltip({ content, ...props }: React.ComponentProps<typeof RechartsPrimitive.Tooltip>) {
    return <RechartsPrimitive.Tooltip cursor={false} content={content ?? <ChartTooltipContent />} {...props} />;
}

function ChartTooltipContent({
    active,
    payload,
    label,
    className,
    hideLabel = false,
    labelFormatter,
    formatter,
}: React.ComponentProps<'div'> & {
    active?: boolean;
    payload?: ChartPayloadItem[];
    label?: string;
    hideLabel?: boolean;
    labelFormatter?: (label: unknown, payload: unknown) => React.ReactNode;
    formatter?: (value: unknown, name: unknown, item: unknown, index: number, payload: unknown) => React.ReactNode;
}) {
    const { config } = useChart();

    if (!active || !payload?.length) return null;

    return (
        <div className={cn('border-border/60 bg-popover text-popover-foreground grid min-w-40 gap-2 rounded-lg border px-3 py-2 text-xs shadow-md', className)}>
            {!hideLabel && <div className="font-medium">{labelFormatter ? labelFormatter(label, payload) : label}</div>}
            <div className="grid gap-1">
                {payload.map((item, index: number) => {
                    const key = item.dataKey ?? item.name ?? `item-${index}`;
                    const itemConfig = key ? config[key] ?? {} : {};
                    const value = formatter ? formatter(item.value, item.name, item, index, payload) : item.value;

                    return (
                        <div key={`${item.dataKey ?? item.name ?? index}`} className="flex items-center gap-2">
                            <span
                                className="inline-block size-2 rounded-sm"
                                style={{ backgroundColor: itemConfig.color ?? item.color }}
                            />
                            <span className="text-muted-foreground">{itemConfig.label ?? item.name ?? key}</span>
                            <span className="ml-auto font-medium">{value as React.ReactNode}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function ChartLegend({
    content,
    ...props
}: React.ComponentProps<typeof RechartsPrimitive.Legend>) {
    return <RechartsPrimitive.Legend content={content ?? <ChartLegendContent />} {...props} />;
}

function ChartLegendContent({ payload, className }: React.ComponentProps<'div'> & { payload?: ChartLegendItem[] }) {
    const { config } = useChart();

    if (!payload?.length) return null;

    return (
        <div className={cn('flex flex-wrap items-center justify-center gap-4', className)}>
            {payload.map((item: ChartLegendItem) => {
                const key = item.dataKey ?? item.value ?? '';
                const itemConfig = key ? config[key] ?? {} : {};

                return (
                    <div key={key} className="flex items-center gap-2">
                        <span className="size-2 rounded-sm" style={{ backgroundColor: item.color ?? itemConfig.color }} />
                        <span className="text-muted-foreground text-xs">{itemConfig.label ?? item.value}</span>
                    </div>
                );
            })}
        </div>
    );
}

export { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent };
