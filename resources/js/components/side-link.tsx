import { FilePenLine, Folder, Headphones, Languages, LayoutDashboard, Newspaper, Podcast, ShieldCheck, Tags, User, UserCog, UsersRound } from 'lucide-react';
import type React from 'react';

interface NavLink {
    title: string;
    label?: string;
    href: string;
    icon?: React.ReactElement;
    permission?: string;
    level?: number;
    children?: NavLink[];
}

export interface SideLink extends NavLink {
    children?: NavLink[];
}

export const sidelinks: SideLink[] = [
    {
        title: 'System',
        icon: <LayoutDashboard size={18} />,
        href: '/',
        children: [
            {
                title: 'Dashboard',
                href: '/',
                icon: <LayoutDashboard size={18} />,
                permission: 'VIEW_DASHBOARD',
            },
            {
                title: 'Profile',
                href: '/portal/profile',
                icon: <User size={18} />,
                permission: 'ANY',
            },
            {
                title: 'Settings',
                href: '/portal/settings',
                icon: <Languages size={18} />,
                permission: 'ANY',
            },
            {
                title: 'Users',
                href: '/portal/users',
                icon: <UsersRound size={18} />,
                permission: 'VIEW_USER',
            },
            {
                title: 'Admins',
                href: '/portal/admins',
                icon: <UserCog size={18} />,
                permission: 'ANY',
            },
            {
                title: 'Admin Roles',
                href: '/portal/admin-roles',
                icon: <ShieldCheck size={18} />,
                permission: 'ANY',
            },
        ],
    },
    {
        title: 'Podcast management',
        icon: <Podcast size={18} />,
        href: '/portal/podcasts',
        children: [
            {
                title: 'Podcasts',
                href: '/portal/podcasts',
                icon: <Podcast size={18} />,
                permission: 'VIEW_PODCAST',
            },
            {
                title: 'Episodes',
                href: '/portal/episodes',
                icon: <Headphones size={18} />,
                permission: 'VIEW_EPISODE',
            },
            {
                title: 'Publishers',
                href: '/portal/publishers',
                icon: <Newspaper size={18} />,
                permission: 'VIEW_PUBLISHER',
            },
            {
                title: 'Authors',
                href: '/portal/authors',
                icon: <FilePenLine size={18} />,
                permission: 'VIEW_AUTHOR',
            },
            {
                title: 'Categories',
                href: '/portal/categories',
                icon: <Folder size={18} />,
                permission: 'VIEW_CATEGORY',
            },
            {
                title: 'Tags',
                href: '/portal/tags',
                icon: <Tags size={18} />,
                permission: 'VIEW_TAG',
            },
        ],
    },
];
