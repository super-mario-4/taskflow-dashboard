import React from 'react';
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarHeader,
} from '@/components/ui/sidebar.jsx';
import {
    HomeIcon,
    ListTodoIcon,
    CheckCircle2Icon,
    Sparkles,
} from 'lucide-react';
import { useLocation, Link } from 'react-router';

const AppSidebar = () => {
    const location = useLocation();

    const isActive = (path) => location.pathname === path;

    const navigationItems = [
        {
            title: 'Dashboard',
            path: '/dashboard',
            icon: HomeIcon,
        },
        {
            title: 'Tasks',
            path: '/tasks',
            icon: ListTodoIcon,
            badge: '12',
        },
        {
            title: 'Completed',
            path: '/completed',
            icon: CheckCircle2Icon,
        },
    ];

    return (
        /* Firebase uslubidagi toza border va fon */
        <Sidebar className="border-r border-border/40 bg-sidebar/95 backdrop-blur-md select-none">
            <div className="flex h-full flex-col justify-between py-3">
                {/* ---------------- Firebase Style Header ---------------- */}
                <SidebarHeader className="px-4 py-2">
                    <div className="flex items-center gap-3">
                        {/* Firebase olov/logo uslubida kichik minimal konteyner */}
                        <div className="flex size-8 items-center justify-center rounded-sm bg-primary/10 text-primary border border-primary/20 shadow-xs">
                            <Sparkles className="size-4.5" />
                        </div>
                        <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-bold tracking-tight text-foreground">
                                    TaskFlow
                                </span>
                                <span className="text-[10px] font-semibold px-1.5 py-0.2 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 rounded-xs uppercase tracking-wider">
                                    Pro
                                </span>
                            </div>
                            <span className="text-[11px] text-muted-foreground font-medium">
                                Console
                            </span>
                        </div>
                    </div>
                </SidebarHeader>

                {/* ---------------- Firebase Style Main Navigation ---------------- */}
                <SidebarContent className="px-3 mt-4">
                    <SidebarGroup className="p-0">
                        {/* Kichik va jiddiy sarlavha */}
                        <SidebarGroupLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 px-2 mb-2">
                            Overview
                        </SidebarGroupLabel>

                        <SidebarMenu className="space-y-1">
                            {navigationItems.map((item) => {
                                const Icon = item.icon;
                                const active = isActive(item.path);

                                return (
                                    <SidebarMenuItem key={item.path}>
                                        <Link
                                            to={item.path}
                                            className="block w-full"
                                        >
                                            <SidebarMenuButton
                                                isActive={active}
                                                /* Firebase style: Pill o'rniga engil burchakli, toza va flat UI */
                                                className={`
                                                    group relative flex w-full items-center gap-3 rounded-xs px-3 py-2.5 text-xs font-medium transition-all duration-150 cursor-pointer
                                                    ${
                                                        active
                                                            ? 'bg-primary/10 text-primary font-semibold border-r-2 border-primary'
                                                            : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
                                                    }
                                                `}
                                            >
                                                {/* Ikonka */}
                                                <Icon
                                                    className={`size-4 transition-colors ${
                                                        active
                                                            ? 'text-primary'
                                                            : 'text-muted-foreground group-hover:text-foreground'
                                                    }`}
                                                />

                                                {/* Menyu matni */}
                                                <span className="flex-1 tracking-wide">
                                                    {item.title}
                                                </span>

                                                {/* Firebase uslubidagi ixcham badge */}
                                                {item.badge && (
                                                    <span
                                                        className={`text-[10px] font-mono font-medium px-1.5 py-0.5 rounded-xs border transition-colors ${
                                                            active
                                                                ? 'bg-primary/10 border-primary/30 text-primary'
                                                                : 'bg-muted/60 border-border/50 text-muted-foreground group-hover:bg-accent'
                                                        }`}
                                                    >
                                                        {item.badge}
                                                    </span>
                                                )}
                                            </SidebarMenuButton>
                                        </Link>
                                    </SidebarMenuItem>
                                );
                            })}
                        </SidebarMenu>
                    </SidebarGroup>
                </SidebarContent>
            </div>
        </Sidebar>
    );
};

export default AppSidebar;
