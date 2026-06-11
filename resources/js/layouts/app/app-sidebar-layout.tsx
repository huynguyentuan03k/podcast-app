import { AppSidebar } from '@/components/app-sidebar';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { PortalTopbar } from '@/components/portal-topbar';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { type BreadcrumbItem } from '@/types';
import { type PropsWithChildren } from 'react';

export default function AppSidebarLayout({ children, breadcrumbs = [] }: PropsWithChildren<{ breadcrumbs?: BreadcrumbItem[] }>) {
    return (
        <SidebarProvider>
            <AppSidebar />
            <main className="flex min-h-svh flex-1 flex-col">
                <header className="flex h-16 shrink-0 items-center justify-between gap-4 border-b border-sidebar-border/50 px-4">
                    <div className="flex min-w-0 items-center gap-2">
                        <SidebarTrigger />
                        <Breadcrumbs breadcrumbs={breadcrumbs} />
                    </div>
                    <PortalTopbar />
                </header>
                <section className="flex flex-1 flex-col overflow-hidden">{children}</section>
            </main>
        </SidebarProvider>
    );
}
