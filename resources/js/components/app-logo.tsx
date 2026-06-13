import { useBrandAssets } from '@/hooks/use-brand-assets';
import { cn } from '@/lib/utils';
import AppLogoIcon from './app-logo-icon';

export default function AppLogo() {
    const { favicon, logo } = useBrandAssets();

    return (
        <div className="flex min-w-0 flex-1 items-center group-data-[collapsible=icon]:justify-center">
            <div
                className={cn(
                    'flex aspect-square size-8 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground',
                    logo && 'hidden group-data-[collapsible=icon]:flex',
                )}
            >
                {favicon ? (
                    <img src={favicon} alt="Website favicon" className="size-5 object-contain" />
                ) : (
                    <AppLogoIcon className="size-5 fill-current text-white dark:text-black" />
                )}
            </div>
            <div className="w-full min-w-0 group-data-[collapsible=icon]:hidden">
                {logo ? (
                    <div className="h-20 w-full max-w-[14rem] overflow-hidden">
                        <img src={logo} alt="Website logo" className="h-full w-full object-cover object-left" />
                    </div>
                ) : (
                    <AppLogoIcon className="size-9 fill-current text-sidebar-foreground" />
                )}
            </div>
        </div>
    );
}
