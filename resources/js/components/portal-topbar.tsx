import AppearanceToggleDropdown from '@/components/appearance-dropdown';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { BookText, Globe, RefreshCcw, Settings, Telescope, UserRound } from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

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
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="ml-1 size-10 rounded-full p-1 transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
                        aria-label="Open account menu"
                    >
                        <Avatar className="size-9 rounded-full ring-1 ring-border/70">
                            <AvatarFallback className="bg-neutral-950 text-xs font-semibold text-white dark:bg-neutral-100 dark:text-neutral-950">
                                HN
                            </AvatarFallback>
                        </Avatar>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 rounded-lg" align="end" sideOffset={8}>
                    <div className="px-2 py-1.5">
                        <p className="text-sm font-medium">Account</p>
                        <p className="text-xs text-muted-foreground">Profile and settings</p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                        <Link className="flex w-full items-center" to="/portal/profile">
                            <UserRound className="mr-2 size-4" />
                            Profile
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                        <Link className="flex w-full items-center" to="/portal/settings">
                            <Settings className="mr-2 size-4" />
                            Settings
                        </Link>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
