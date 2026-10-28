"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import {
    Sidebar,
    SidebarContent,
    SidebarHeader,
    SidebarFooter,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
} from "@/components/ui/sidebar"
import {
    LayoutDashboard,
    Building2,
    GraduationCap,
    Presentation,
    Users,
    ShieldCheck,
    CreditCard,
    MessageSquare,
    Activity,
    Settings,
    LogOut,
    UserCircle,
    ChevronLeft,
    ChevronRight,
    Terminal,
    PieChart,
    UserCheck,
    Wrench,
    Tag,
    Mail,
    UserX,
    BellRing
} from "lucide-react"
import { cn } from "@/lib/utils"
import { usePlatformStaffStore } from "@/store/usePlatformStaffStore"

export interface ConsoleSidebarSection {
    title: string;
    items: {
        icon: React.ComponentType<{ className?: string; size?: number }>;
        label: string;
        href: string;
    }[];
}

export const CONSOLE_SIDEBAR_SECTIONS: ConsoleSidebarSection[] = [
    {
        title: "Ecosystem Management",
        items: [
            { icon: LayoutDashboard, label: "Overview", href: "/console" },
            { icon: Building2, label: "Schools", href: "/console/schools" },
            { icon: GraduationCap, label: "Students", href: "/console/students" },
            { icon: Presentation, label: "Teachers", href: "/console/teachers" },
            { icon: Users, label: "Parents", href: "/console/parents" },
            { icon: UserX, label: "Deletions & Deactivations", href: "/console/deletions" },
        ]
    },
    {
        title: "Revenue & Billing Architecture",
        items: [
            { icon: CreditCard, label: "Revenue Architecture", href: "/console/billing/pricing" },
            { icon: Tag, label: "Coupon Codes", href: "/console/billing/coupons" },
            { icon: PieChart, label: "Global Revenue", href: "/console/finance" },
            { icon: Wrench, label: "System Architecture", href: "/console/features" },
        ]
    },
    {
        title: "Operations & Communications",
        items: [
            { icon: MessageSquare, label: "Support Center", href: "/console/support" },
            { icon: BellRing, label: "Notification Routing", href: "/console/notifications" },
            { icon: Terminal, label: "Activity Logs", href: "/console/logs" },
            { icon: Activity, label: "Monitoring", href: "/console/monitoring" },
            { icon: Mail, label: "Email Templates", href: "/console/email-templates" },
        ]
    },
    {
        title: "Administration & Security",
        items: [
            { icon: UserCircle, label: "Admin Profile & Socials", href: "/console/profile" },
            { icon: UserCheck, label: "Staff Accounts", href: "/console/staff" },
            { icon: Settings, label: "Platform Settings", href: "/console/settings" },
        ]
    }
];

// Flat export for compatibility
export const consoleMenuItems = CONSOLE_SIDEBAR_SECTIONS.flatMap((s) => s.items);

interface ConsoleSidebarProps {
    isCollapsed: boolean;
    setIsCollapsed: (collapsed: boolean) => void;
}

export function ConsoleSidebar({ isCollapsed, setIsCollapsed }: ConsoleSidebarProps) {
    const pathname = usePathname()
    const { staff, clearStaff } = usePlatformStaffStore()

    return (
        <Sidebar
            collapsible="icon"
            className={cn(
                "transition-all duration-300 ease-in-out border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950",
                isCollapsed ? "w-[80px]" : "w-[260px]"
            )}
        >
            <SidebarHeader className="pt-8 flex items-center justify-between px-4 relative">
                <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
                        <ShieldCheck className="h-5 w-5 text-white" />
                    </div>
                    {!isCollapsed && (
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">OPERATIONS</span>
                            <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest">Console v1.0</span>
                        </div>
                    )}
                </div>

                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="absolute -right-3 top-20 z-50 h-6 w-6 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-all shadow-sm"
                >
                    {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
                </button>
            </SidebarHeader>

            <SidebarContent className="mt-8 px-2 space-y-4">
                {CONSOLE_SIDEBAR_SECTIONS.map((section, idx) => (
                    <div key={section.title} className="space-y-1">
                        {!isCollapsed ? (
                            <div className="px-3 pt-2 pb-1 text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                                {section.title}
                            </div>
                        ) : idx > 0 ? (
                            <div className="h-px bg-slate-200/80 dark:bg-slate-800 my-2 mx-2" />
                        ) : null}

                        <SidebarMenu>
                            {section.items.map((item) => {
                                const isActive = pathname === item.href || (item.href !== "/console" && pathname?.startsWith(item.href));
                                return (
                                    <SidebarMenuItem key={item.label}>
                                        <Link href={item.href}>
                                            <SidebarMenuButton
                                                className={cn(
                                                    "flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all duration-200",
                                                    isActive
                                                        ? "bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 font-bold shadow-sm"
                                                        : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-slate-100"
                                                )}
                                                tooltip={isCollapsed ? item.label : undefined}
                                            >
                                                <item.icon className={cn("h-5 w-5 shrink-0", isActive ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400")} />
                                                {!isCollapsed && <span className="font-medium text-xs truncate">{item.label}</span>}
                                            </SidebarMenuButton>
                                        </Link>
                                    </SidebarMenuItem>
                                );
                            })}
                        </SidebarMenu>
                    </div>
                ))}
            </SidebarContent>

            <SidebarFooter className="p-4 border-t border-slate-800">
                <div className="flex items-center gap-3 px-2 py-3 rounded-lg bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
                    <Link href="/console/profile" className="flex items-center gap-3 flex-1 overflow-hidden group">
                        <div className="h-8 w-8 rounded-full bg-indigo-600/20 text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-all flex items-center justify-center shrink-0">
                            <UserCircle className="h-5 w-5" />
                        </div>
                        {!isCollapsed && (
                            <div className="flex flex-col flex-1 overflow-hidden">
                                <span className="text-xs font-semibold text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{staff?.fullName || "Console Admin"}</span>
                                <span className="text-[10px] text-slate-500 font-bold uppercase truncate">{staff?.role || "STAFF"}</span>
                            </div>
                        )}
                    </Link>
                    {!isCollapsed && (
                        <button 
                            onClick={clearStaff}
                            title="Sign out of console"
                            className="p-1 hover:bg-slate-800 rounded text-slate-500 hover:text-red-400 transition-colors"
                        >
                            <LogOut size={14} />
                        </button>
                    )}
                </div>
            </SidebarFooter>
        </Sidebar>
    )
}
