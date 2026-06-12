import AppearanceToggleDropdown from '@/components/appearance-dropdown';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { BookText, Globe, RefreshCcw, Telescope } from 'lucide-react';
import { useState } from 'react';
import { useLocation } from 'react-router-dom';

const languages = [
    { label: 'EN', value: 'en' },
    { label: 'VI', value: 'vi' },
    { label: 'JA', value: 'ja' },
];

const portalLinks = [
    {
        label: 'Swagger',
        href: '/api/documentation',
        icon: BookText,
        iconClassName: 'text-blue-600',
        hoverClassName: 'hover:text-blue-600',
    },
    {
        label: 'Telescope',
        href: '/telescope',
        icon: Telescope,
        iconClassName: 'text-emerald-600',
        hoverClassName: 'hover:text-emerald-600',
    },
    {
        label: 'Horizon',
        href: '/horizon',
        icon: Globe,
        iconClassName: 'text-violet-600',
        hoverClassName: 'hover:text-violet-600',
    },
] as const;

export function PortalTopbar() {
    const location = useLocation();
    const currentLanguage = new URLSearchParams(location.search).get('lang') ?? 'en';
    const [isClearingCache, setIsClearingCache] = useState(false);
    const [cacheMessage, setCacheMessage] = useState<string | null>(null);

    const updateLanguage = (lang: string) => {
        const url = new URL(window.location.href);
        url.searchParams.set('lang', lang);
        window.location.href = url.toString();
    };

    const clearCache = async () => {
        setIsClearingCache(true);
        setCacheMessage(null);

        try {
            const response = await fetch('/admin/clear-cache', {
                credentials: 'same-origin',
                headers: {
                    Accept: 'application/json',
                },
            });

            const data: { message?: string } = await response.json();
            setCacheMessage(data.message ?? 'Cache cleared.');
        } finally {
            setIsClearingCache(false);
        }
    };

    return (
        <div className="flex flex-wrap items-center justify-end gap-2">
            {portalLinks.map((item) => (
                <Tooltip key={item.label}>
                    <TooltipTrigger asChild>
                        <Button
                            asChild
                            variant="ghost"
                            size="icon"
                            className={cn('group h-9 w-9 rounded-md transition-colors', item.hoverClassName)}
                        >
                            <a href={item.href} target="_blank" rel="noreferrer" aria-label={item.label}>
                                <item.icon className={cn('size-4 transition-colors', item.iconClassName)} />
                            </a>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>{item.label}</TooltipContent>
                </Tooltip>
            ))}

            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 rounded-md"
                        onClick={clearCache}
                        disabled={isClearingCache}
                        aria-label="Clear cache"
                    >
                        <RefreshCcw className={cn('size-4', isClearingCache && 'animate-spin')} />
                    </Button>
                </TooltipTrigger>
                <TooltipContent>Clear cache</TooltipContent>
            </Tooltip>

            {cacheMessage && <span className="text-xs text-muted-foreground">{cacheMessage}</span>}

            <AppearanceToggleDropdown />
            <Select value={currentLanguage} onValueChange={updateLanguage}>
                <SelectTrigger className="h-9 w-[92px] rounded-md">
                    <SelectValue placeholder="EN" />
                </SelectTrigger>
                <SelectContent align="end">
                    {languages.map((language) => (
                        <SelectItem key={language.value} value={language.value}>
                            {language.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <div className="ml-1 flex h-9 w-9 items-center justify-center rounded-full bg-muted text-xs font-semibold">HN</div>
        </div>
    );
}
