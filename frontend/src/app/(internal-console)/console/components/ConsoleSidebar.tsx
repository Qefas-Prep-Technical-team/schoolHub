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
    Wrench
} from "lucide-react"
import { cn } from "@/lib/utils"
import { usePlatformStaffStore } from "@/store/usePlatformStaffStore"

export const consoleMenuItems = [
    { icon: LayoutDashboard, label: "Overview", href: "/console" },
    { icon: Building2, label: "Schools", href: "/console/schools" },
    { icon: GraduationCap, label: "Students", href: "/console/students" },
    { icon: Presentation, label: "Teachers", href: "/console/teachers" },
    { icon: Users, label: "Parents", href: "/console/parents" },
    { icon: Wrench, label: "Features", href: "/console/features" },
    { icon: CreditCard, label: "Subscription Tiers", href: "/console/billing/pricing" },
    { icon: PieChart, label: "Global Revenue", href: "/console/transactions" },
    { icon: MessageSquare, label: "Support Center", href: "/console/support" },
    { icon: Activity, label: "Monitoring", href: "/console/monitoring" },
    { icon: UserCheck, label: "Staff Accounts", href: "/console/staff" },
    { icon: Terminal, label: "Activity Logs", href: "/console/logs" },
    { icon: Settings, label: "Platform Settings", href: "/console/settings" },
]

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

            <SidebarContent className="mt-10 px-2">
                <SidebarMenu>
                    {consoleMenuItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <SidebarMenuItem key={item.label}>
                                <Link href={item.href}>
                                    <SidebarMenuButton
                                        className={cn(
                                            "flex items-center gap-3 rounded-lg px-3 py-6 transition-all duration-200",
                                            isActive
                                                ? "bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 shadow-sm"
                                                : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-slate-100"
                                        )}
                                    >
                                        <item.icon className={cn("h-5 w-5", isActive ? "text-indigo-400" : "text-slate-400")} />
                                        {!isCollapsed && <span className="font-medium">{item.label}</span>}
                                    </SidebarMenuButton>
                                </Link>
                            </SidebarMenuItem>
                        );
                    })}
                </SidebarMenu>
            </SidebarContent>

            <SidebarFooter className="p-4 border-t border-slate-800">
                <div className="flex items-center gap-3 px-2 py-3 rounded-lg bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
                    <div className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center">
                        <UserCircle className="h-5 w-5 text-slate-400" />
                    </div>
                    {!isCollapsed && (
                        <div className="flex flex-col flex-1 overflow-hidden">
                            <span className="text-xs font-semibold text-slate-900 dark:text-white truncate">{staff?.fullName}</span>
                            <span className="text-[10px] text-slate-500 font-bold uppercase truncate">{staff?.role}</span>
                        </div>
                    )}
                    {!isCollapsed && (
                        <button 
                            onClick={clearStaff}
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
