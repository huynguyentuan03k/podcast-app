import AppearanceToggleDropdown from '@/components/appearance-dropdown';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BookText, Globe, RefreshCcw, Telescope } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const languages = [
    { label: 'EN', value: 'en' },
    { label: 'VI', value: 'vi' },
    { label: 'JA', value: 'ja' },
];

export function PortalTopbar() {
    const location = useLocation();
    const currentLanguage = new URLSearchParams(location.search).get('lang') ?? 'en';

    const updateLanguage = (lang: string) => {
        const url = new URL(window.location.href);
        url.searchParams.set('lang', lang);
        window.location.href = url.toString();
    };

    return (
        <div className="flex flex-wrap items-center justify-end gap-2">
            <Button asChild variant="ghost" size="icon" className="h-9 w-9 rounded-md">
                <a href="/api/documentation" target="_blank" rel="noreferrer" title="Swagger">
                    <BookText className="size-4" />
                </a>
            </Button>
            <Button asChild variant="ghost" size="icon" className="h-9 w-9 rounded-md">
                <a href="/horizon" target="_blank" rel="noreferrer" title="Horizon">
                    <Globe className="size-4" />
                </a>
            </Button>
            <Button asChild variant="ghost" size="icon" className="h-9 w-9 rounded-md">
                <a href="/telescope" target="_blank" rel="noreferrer" title="Telescope">
                    <Telescope className="size-4" />
                </a>
            </Button>
            <Button asChild variant="ghost" size="icon" className="h-9 w-9 rounded-md">
                <a href="/admin/clear-cache" title="Clear cache">
                    <RefreshCcw className="size-4" />
                </a>
            </Button>
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
