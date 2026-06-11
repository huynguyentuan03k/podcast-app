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
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button asChild variant="ghost" size="icon" className="h-9 w-9 rounded-md">
                        <a href="/api/documentation" target="_blank" rel="noreferrer" aria-label="Swagger">
                            <BookText className="size-4" />
                        </a>
                    </Button>
                </TooltipTrigger>
                <TooltipContent>Swagger</TooltipContent>
            </Tooltip>

            <Tooltip>
                <TooltipTrigger asChild>
                    <Button asChild variant="ghost" size="icon" className="h-9 w-9 rounded-md">
                        <a href="/horizon" target="_blank" rel="noreferrer" aria-label="Horizon">
                            <Globe className="size-4" />
                        </a>
                    </Button>
                </TooltipTrigger>
                <TooltipContent>Horizon</TooltipContent>
            </Tooltip>

            <Tooltip>
                <TooltipTrigger asChild>
                    <Button asChild variant="ghost" size="icon" className="h-9 w-9 rounded-md">
                        <a href="/telescope" target="_blank" rel="noreferrer" aria-label="Telescope">
                            <Telescope className="size-4" />
                        </a>
                    </Button>
                </TooltipTrigger>
                <TooltipContent>Telescope</TooltipContent>
            </Tooltip>

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
