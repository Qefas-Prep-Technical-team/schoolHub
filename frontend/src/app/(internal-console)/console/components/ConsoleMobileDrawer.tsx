"use client"

import React, { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
    Menu,
    X,
    ShieldCheck,
    LogOut,
    UserCircle,
    LayoutDashboard,
    Building2,
    GraduationCap,
    Presentation,
    Users,
    CreditCard,
    MessageSquare,
    Activity,
    Settings,
    Terminal,
    PieChart,
    UserCheck,
    Wrench,
    Tag,
    Mail,
    UserX,
    ChevronRight
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger
} from "@/components/ui/sheet"
import { usePlatformStaffStore } from "@/store/usePlatformStaffStore"

interface ConsoleNavCategory {
    title: string;
    items: {
        icon: React.ComponentType<{ className?: string; size?: number }>;
        label: string;
        href: string;
        badge?: string;
    }[];
}

const CONSOLE_NAV_SECTIONS: ConsoleNavCategory[] = [
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
        title: "Platform & Billing Architecture",
        items: [
            { icon: Wrench, label: "System Architecture", href: "/console/features" },
            { icon: CreditCard, label: "Revenue Architecture", href: "/console/billing/pricing" },
            { icon: Tag, label: "Coupon Codes", href: "/console/billing/coupons" },
            { icon: PieChart, label: "Global Revenue", href: "/console/finance" },
        ]
    },
    {
        title: "Operations & Telemetry",
        items: [
            { icon: MessageSquare, label: "Support Center", href: "/console/support" },
            { icon: Activity, label: "Monitoring", href: "/console/monitoring" },
            { icon: Terminal, label: "Activity Logs", href: "/console/logs" },
        ]
    },
    {
        title: "Administration",
        items: [
            { icon: UserCheck, label: "Staff Accounts", href: "/console/staff" },
            { icon: Settings, label: "Platform Settings", href: "/console/settings" },
            { icon: Mail, label: "Email Templates", href: "/console/email-templates" },
        ]
    }
]

export function ConsoleMobileDrawer() {
    const [open, setOpen] = useState(false)
    const pathname = usePathname()
    const { staff, clearStaff } = usePlatformStaffStore()

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button
                    variant="outline"
                    size="icon"
                    aria-label="Open navigation menu"
                    className="h-10 w-10 rounded-xl md:hidden border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 shadow-sm transition-all"
                >
                    <Menu size={20} />
                </Button>
            </SheetTrigger>

            <SheetContent
                side="left"
                className="p-0 w-[85vw] max-w-[340px] flex flex-col bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-white/10 z-50 overflow-hidden"
            >
                {/* Header */}
                <SheetHeader className="p-5 border-b border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-slate-900/50 text-left">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 shadow-md shadow-indigo-600/20">
                                <ShieldCheck className="h-5 w-5 text-white" />
                            </div>
                            <div className="flex flex-col">
                                <SheetTitle className="text-sm font-black text-slate-900 dark:text-white tracking-tight uppercase">
                                    Qefas Operations
                                </SheetTitle>
                                <span className="text-[10px] text-indigo-500 dark:text-indigo-400 font-bold uppercase tracking-widest">
                                    Console v1.0
                                </span>
                            </div>
                        </div>
                    </div>
                </SheetHeader>

                {/* Nav Items */}
                <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 custom-scrollbar">
                    {CONSOLE_NAV_SECTIONS.map((section) => (
                        <div key={section.title} className="space-y-1">
                            <p className="px-3 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2">
                                {section.title}
                            </p>
                            <div className="space-y-0.5">
                                {section.items.map((item) => {
                                    const isActive = pathname === item.href || (item.href !== "/console" && pathname?.startsWith(item.href));
                                    const Icon = item.icon;
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            onClick={() => setOpen(false)}
                                            className={cn(
                                                "flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 group",
                                                isActive
                                                    ? "bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 font-bold shadow-sm"
                                                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5"
                                            )}
                                        >
                                            <div className="flex items-center gap-3 min-w-0">
                                                <Icon
                                                    size={18}
                                                    className={cn(
                                                        "shrink-0 transition-colors",
                                                        isActive
                                                            ? "text-indigo-600 dark:text-indigo-400"
                                                            : "text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300"
                                                    )}
                                                />
                                                <span className="truncate">{item.label}</span>
                                            </div>
                                            {isActive && (
                                                <span className="h-1.5 w-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400 shrink-0" />
                                            )}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer Staff Hub */}
                <div className="p-4 border-t border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-slate-900/50">
                    <div className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-sm">
                        <div className="flex items-center gap-2.5 min-w-0">
                            <div className="h-8 w-8 rounded-lg bg-indigo-600/10 dark:bg-indigo-600/20 flex items-center justify-center shrink-0 border border-indigo-500/20">
                                <UserCircle size={18} className="text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <div className="flex flex-col min-w-0">
                                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                    {staff?.fullName || "Staff Member"}
                                </p>
                                <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tight truncate">
                                    {staff?.role || "Console Staff"}
                                </p>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                                clearStaff();
                                setOpen(false);
                            }}
                            className="h-8 w-8 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-500/10 shrink-0"
                            title="Sign out"
                        >
                            <LogOut size={16} />
                        </Button>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
