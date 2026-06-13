import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { sidelinks } from '@/components/side-link';
import { Separator } from '@/components/ui/separator';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { Link, useLocation } from 'react-router-dom';
import AppLogo from './app-logo';

export function AppSidebar() {
    const { pathname: url } = useLocation();
    const isAdminPortal = url.startsWith('/portal') || url.startsWith('/admin') || url.startsWith('/dashboard');
    const homeHref = isAdminPortal ? '/' : '/dashboard';

    return (
        <Sidebar collapsible="icon" variant="sidebar">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild className="h-20 items-stretch px-1.5 py-1 group-data-[collapsible=icon]:h-8">
                            <Link to={homeHref}>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <Separator />

            <SidebarContent className="px-0 pt-3">
                <NavMain items={sidelinks} />
            </SidebarContent>

            <SidebarFooter className="mt-auto">
                <div className="px-2 text-[11px] font-medium text-sidebar-foreground/55 group-data-[collapsible=icon]:hidden">
                    Version {__APP_VERSION__}
                </div>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
