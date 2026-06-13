import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { ChevronsUpDown, LogOut, Settings, UserRound } from 'lucide-react';
import { Link } from 'react-router-dom';

export function NavUser() {
    const { state } = useSidebar();
    const isMobile = useIsMobile();
    const csrfToken = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ?? '';

    return (
        <SidebarMenu className="gap-0">
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="lg"
                            aria-label="Account menu"
                            className={cn(
                                'group/account h-14 rounded-lg border border-sidebar-border/70 bg-sidebar-accent/35 px-2.5 shadow-sm transition-all duration-200',
                                'hover:border-sidebar-border hover:bg-sidebar-accent hover:shadow-md',
                                'data-[state=open]:border-sidebar-border data-[state=open]:bg-sidebar-accent',
                                'group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:size-10! group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:rounded-xl group-data-[collapsible=icon]:border-transparent group-data-[collapsible=icon]:bg-transparent group-data-[collapsible=icon]:p-0!',
                            )}
                        >
                            <Avatar className="size-9 rounded-xl ring-1 ring-sidebar-border/70 group-data-[collapsible=icon]:size-8">
                                <AvatarImage alt="Account" />
                                <AvatarFallback className="rounded-xl bg-neutral-950 text-xs font-semibold text-white dark:bg-neutral-100 dark:text-neutral-950">
                                    <UserRound className="size-4" />
                                </AvatarFallback>
                            </Avatar>
                            <div className="grid min-w-0 flex-1 text-left leading-tight group-data-[collapsible=icon]:hidden">
                                <span className="truncate text-sm font-semibold text-sidebar-foreground">Account</span>
                                <span className="truncate text-xs text-sidebar-foreground/60">Profile and settings</span>
                            </div>
                            <ChevronsUpDown className="ml-auto size-4 text-sidebar-foreground/55 transition-transform group-data-[collapsible=icon]:hidden group-data-[state=open]/account:rotate-180" />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-(--radix-dropdown-menu-trigger-width) min-w-60 rounded-lg"
                        align="end"
                        side={isMobile ? 'top' : state === 'collapsed' ? 'right' : 'top'}
                        sideOffset={10}
                    >
                        <div className="px-2 py-1.5">
                            <p className="text-sm font-medium">Account</p>
                            <p className="text-xs text-muted-foreground">Profile and settings</p>
                        </div>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Link className="flex w-full items-center" to="/portal/aboutme">
                                <UserRound className="mr-2 size-4" />
                                My profile
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link className="flex w-full items-center" to="/portal/settings">
                                <Settings className="mr-2 size-4" />
                                Settings
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <form action="/admin/logout" method="post" className="w-full">
                                <input type="hidden" name="_token" value={csrfToken} />
                                <button type="submit" className="flex w-full items-center">
                                    <LogOut className="mr-2 size-4" />
                                    Log out
                                </button>
                            </form>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}
