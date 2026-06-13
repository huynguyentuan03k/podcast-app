import { type SideLink } from '@/components/side-link';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

function isActive(url: string, href: string) {
    return url === href || url.startsWith(`${href}/`);
}

function NavSection({ group, url }: { group: SideLink; url: string }) {
    const defaultOpen = (group.children ?? []).some((item) => isActive(url, item.href));
    const [open, setOpen] = useState(defaultOpen);
    const activeParent = defaultOpen || isActive(url, group.href);

    if (!group.children?.length) {
        return null;
    }

    return (
        <Collapsible open={open} onOpenChange={setOpen} className="group/collapsible">
            <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                    <SidebarMenuButton isActive={activeParent} tooltip={group.title}>
                        {group.icon}
                        <span>{group.title}</span>
                        {open ? <ChevronDown className="ml-auto size-4" /> : <ChevronRight className="ml-auto size-4" />}
                    </SidebarMenuButton>
                </CollapsibleTrigger>
            </SidebarMenuItem>
            <CollapsibleContent>
                <SidebarMenuSub>
                    {group.children.map((item) => {
                        const active = isActive(url, item.href);

                        return (
                            <SidebarMenuSubItem key={`${item.title}-${item.href}`}>
                                <SidebarMenuSubButton asChild isActive={active}>
                                    <Link to={item.href}>
                                        {item.icon}
                                        <span>{item.title}</span>
                                    </Link>
                                </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                        );
                    })}
                </SidebarMenuSub>
            </CollapsibleContent>
        </Collapsible>
    );
}

export function NavMain({ items = [] }: { items: SideLink[] }) {
    const { pathname: url } = useLocation();

    return (
        <>
            {items.map((group, index) => (
                <SidebarGroup key={`${group.title}-${group.href}`} className="px-2 py-0">
                    {index > 0 && <SidebarGroupLabel>{group.title}</SidebarGroupLabel>}
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <NavSection group={group} url={url} />
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            ))}
        </>
    );
}
