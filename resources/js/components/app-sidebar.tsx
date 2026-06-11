import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { sidelinks } from '@/components/side-link';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
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
                        <SidebarMenuButton size="lg" asChild className="px-2">
                            <Link to={homeHref}>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent className="px-0">
                <NavMain items={sidelinks} />
            </SidebarContent>

            <SidebarFooter className="mt-auto">
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
