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
    useSidebar,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    LayoutDashboard,
    Users,
    ClipboardList,
    FileCheck2,
    BarChart3,
    CalendarDays,
    MessageSquare,
    BellRing,
    WalletCards,
    UserCircle,
    Settings,
    LifeBuoy,
    BookMarked,
    Brain,
    CalendarClock,
    Award,
    School,
    User2,
    ChevronUp,
    ChevronDown,
    ChevronRight,
    ChevronLeft,
    LogOut,
    Copy,
    LucideIcon,
    CreditCard
} from "lucide-react";
import { Box, Typography } from "@mui/material"
import { cn } from "@/lib/utils"
import { useLogoutMutation } from "@/app/(auth)/login/services/use-auth-mutations"
import { PARENT_FEATURE_FLAGS, ParentFeatureFlagKey } from "./parentFeatureFlags"


// Define the menu item type
interface ParentMenuItem {
    icon: LucideIcon;
    label: string;
    href: string;
    featureKey: ParentFeatureFlagKey;
    section?: string;
}

// Complete parent menu items with feature keys and sections
export const parentMenuItems: ParentMenuItem[] = [
    // === CORE FEATURES ===
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard/parent", featureKey: "dashboard", section: "core" },
    { icon: Users, label: "My Children", href: "/dashboard/parent/my-children", featureKey: "children", section: "core" },
    { icon: ClipboardList, label: "Assignments", href: "/dashboard/parent/assignments", featureKey: "assignments", section: "core" },
    { icon: FileCheck2, label: "Exams & Results", href: "/dashboard/parent/exams&results", featureKey: "results", section: "core" },
    { icon: BarChart3, label: "Performance", href: "/dashboard/parent/performance", featureKey: "performance", section: "core" },
    { icon: CalendarDays, label: "Attendance", href: "/dashboard/parent/attendance", featureKey: "attendance", section: "core" },

    // === MONITORING & COMMUNICATION ===
    { icon: Award, label: "Behavior & Remarks", href: "/parent/behavior", featureKey: "behavior", section: "monitoring" },
    { icon: MessageSquare, label: "Messages", href: "/parent/messages", featureKey: "messages", section: "monitoring" },
    { icon: BellRing, label: "Notifications", href: "/parent/notifications", featureKey: "notifications", section: "monitoring" },

    // === FINANCIAL & RESOURCES ===
    { icon: CreditCard, label: "Subscription", href: "/dashboard/parent/billing", featureKey: "billing", section: "financial" },
    { icon: BookMarked, label: "Resources", href: "/parent/resources", featureKey: "resources", section: "financial" },

    // === ADVANCED TOOLS ===
    { icon: Brain, label: "AI Insights", href: "/parent/ai-insights", featureKey: "aiInsights", section: "advanced" },
    { icon: CalendarClock, label: "Events & Timetable", href: "/parent/events", featureKey: "events", section: "advanced" },

    // === PROFILE & SETTINGS ===
    { icon: UserCircle, label: "Profile", href: "/parent/profile", featureKey: "profile", section: "profile" },
    { icon: Settings, label: "Settings", href: "/parent/settings", featureKey: "settings", section: "profile" },
    { icon: LifeBuoy, label: "Support", href: "/parent/support", featureKey: "support", section: "profile" },
];

// Filter menu items based on feature flags and group by section
const getFilteredParentMenuItemsBySection = () => {
    const filtered = parentMenuItems.filter(item => PARENT_FEATURE_FLAGS[item.featureKey]);

    const sections = {
        core: filtered.filter(item => item.section === 'core'),
        monitoring: filtered.filter(item => item.section === 'monitoring'),
        financial: filtered.filter(item => item.section === 'financial'),
        advanced: filtered.filter(item => item.section === 'advanced'),
        profile: filtered.filter(item => item.section === 'profile'),
    };

    return sections;
};

// Section titles
const PARENT_SECTION_TITLES = {
    core: "Children's Progress",
    monitoring: "Monitoring & Communication",
    financial: "Financial & Resources",
    advanced: "Advanced Tools",
    profile: "Account Settings"
};

export function ParentSidebar() {
    const { state, toggleSidebar } = useSidebar()
    const isCollapsed = state === "collapsed"
    const { mutate: logout } = useLogoutMutation()
    const [isUserOpen, setIsUserOpen] = useState(false)
    const pathname = usePathname()

    // Get filtered menu items grouped by section
    const menuSections = getFilteredParentMenuItemsBySection()

    return (
        <Sidebar
            collapsible="icon"
            className="border-r border-slate-200 dark:border-white/5 bg-white dark:bg-slate-950 transition-all duration-300 ease-in-out"
        >
            {/* Header */}
            <SidebarHeader className="h-20 flex flex-row items-center justify-between px-4 border-b border-slate-100 dark:border-white/5 relative">
                <div className="flex items-center gap-3 overflow-hidden">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-600 shadow-lg shadow-orange-600/20 group-hover:scale-110 transition-transform duration-500">
                        <School className="h-6 w-6 text-white" />
                    </div>
                    {!isCollapsed && (
                        <div className="flex flex-col leading-none transition-all duration-300">
                            <span className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">QEFAS HUB</span>
                            <span className="text-[10px] text-orange-500 font-bold uppercase tracking-widest mt-0.5">Parent Portal</span>
                        </div>
                    )}
                </div>

                {/* Floating Absolute Toggle Button */}
                <button
                    onClick={toggleSidebar}
                    className="absolute -right-3 top-7 h-6 w-6 rounded-full border border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-800 flex items-center justify-center shadow-md hover:bg-orange-50 dark:hover:bg-orange-950/30 transition-all z-50 group hover:scale-110 active:scale-95"
                    aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                    {isCollapsed ? (
                        <ChevronRight className="h-3.5 w-3.5 text-orange-600" />
                    ) : (
                        <ChevronLeft className="h-3.5 w-3.5 text-orange-600" />
                    )}
                </button>
            </SidebarHeader>

            {/* Main Menu */}
            <SidebarContent className="py-6 px-3 custom-scrollbar">
                <SidebarMenu className="gap-6">
                    {/* Render each section */}
                    {Object.entries(menuSections).map(([sectionKey, items]) => {
                        if (items.length === 0) return null;

                        return (
                            <div key={sectionKey} className="flex flex-col gap-1.5">
                                {/* Section Header (only show when not collapsed) */}
                                {!isCollapsed && (
                                    <div className="px-3 mb-1">
                                        <span className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500">
                                            {PARENT_SECTION_TITLES[sectionKey as keyof typeof PARENT_SECTION_TITLES]}
                                        </span>
                                    </div>
                                )}

                                {/* Section Items */}
                                {items.map(({ icon: Icon, label, href, featureKey }) => {
                                    const isActive = pathname === href;
                                    const isDisabled = !PARENT_FEATURE_FLAGS[featureKey];

                                    return (
                                        <SidebarMenuItem key={label}>
                                            <Link href={isDisabled ? "#" : href} className="w-full">
                                                <SidebarMenuButton
                                                    className={cn(
                                                        "relative flex items-center gap-3 h-11 px-3 rounded-xl transition-all duration-200 group overflow-hidden",
                                                        isDisabled
                                                            ? "text-slate-300 dark:text-slate-700 cursor-not-allowed opacity-50"
                                                            : isActive
                                                                ? "bg-orange-600/10 text-orange-600 dark:text-orange-400 font-bold shadow-[0_4px_12px_rgba(234,113,10,0.1)]"
                                                                : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white"
                                                    )}
                                                    disabled={isDisabled}
                                                >
                                                    {isActive && !isDisabled && (
                                                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-orange-600 rounded-r-full shadow-[2px_0_8px_rgba(234,113,10,0.6)]" />
                                                    )}
                                                    <Icon className={cn(
                                                        "h-5 w-5 transition-all duration-300 group-hover:scale-110",
                                                        isActive && !isDisabled ? "text-orange-600 dark:text-orange-400" : "group-hover:text-amber-500"
                                                    )} />
                                                    {!isCollapsed && (
                                                        <span className="text-[13.5px] tracking-tight truncate">{label}</span>
                                                    )}
                                                    
                                                    {isDisabled && !isCollapsed && (
                                                        <span className="ml-auto text-[8px] font-black uppercase tracking-widest bg-slate-100 dark:bg-white/5 px-1.5 py-0.5 rounded text-slate-400">
                                                            Soon
                                                        </span>
                                                    )}

                                                    {!isCollapsed && !isActive && !isDisabled && (
                                                        <div className="absolute right-2 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0">
                                                            <ChevronRight className="h-3.5 w-3.5 text-amber-500/50" />
                                                        </div>
                                                    )}
                                                </SidebarMenuButton>
                                            </Link>
                                        </SidebarMenuItem>
                                    );
                                })}
                            </div>
                        );
                    })}
                </SidebarMenu>
            </SidebarContent>

            {/* Footer */}
            <SidebarFooter className="p-3 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02]">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <DropdownMenu onOpenChange={setIsUserOpen}>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuButton className={cn(
                                    "flex items-center gap-2.5 h-14 w-full rounded-2xl transition-all duration-300 px-2 py-2 group",
                                    isUserOpen ? "bg-white dark:bg-slate-900 shadow-lg ring-1 ring-orange-500/20" : "hover:bg-white dark:hover:bg-white/5 shadow-sm border border-transparent hover:border-slate-200 dark:hover:border-white/10"
                                )}>
                                    <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-xl ring-2 ring-orange-500/10 group-hover:ring-orange-500/30 transition-all duration-500">
                                        <div className="h-full w-full bg-orange-600 flex items-center justify-center text-white">
                                            <User2 className="h-5 w-5" />
                                        </div>
                                    </div>

                                    {!isCollapsed && (
                                        <div className="flex flex-col items-start min-w-0 flex-1">
                                            <span className="font-bold text-xs text-slate-900 dark:text-white leading-none truncate w-full">Parent Account</span>
                                            <span className="text-[9px] text-orange-500 font-bold uppercase tracking-widest mt-1">Management Hub</span>
                                        </div>
                                    )}

                                    {!isCollapsed && (
                                        <div className={cn("transition-transform duration-500 ml-auto mr-1", isUserOpen ? "rotate-180" : "")}>
                                            <ChevronDown className="h-3.5 w-3.5 text-slate-400 group-hover:text-orange-500" />
                                        </div>
                                    )}
                                </SidebarMenuButton>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent
                                side="top"
                                align="end"
                                sideOffset={12}
                                className="w-[240px] rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl p-2 animate-in slide-in-from-bottom-2 duration-300"
                            >
                                <DropdownMenuItem className="flex items-center gap-2 rounded-lg py-2.5 px-3 cursor-pointer text-slate-600 dark:text-slate-400 hover:text-orange-600 dark:hover:text-orange-400 focus:bg-orange-500/10 focus:text-orange-600 transition-all font-medium">
                                    <Users className="h-4 w-4" />
                                    <span>Family Profile</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="flex items-center gap-2 rounded-lg py-2.5 px-3 cursor-pointer text-slate-600 dark:text-slate-400 hover:text-orange-600 dark:hover:text-orange-400 focus:bg-orange-500/10 focus:text-orange-600 transition-all font-medium">
                                    <CreditCard className="h-4 w-4" />
                                    <span>Payment History</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="flex items-center gap-2 rounded-lg py-2.5 px-3 cursor-pointer text-slate-600 dark:text-slate-400 hover:text-orange-600 dark:hover:text-orange-400 focus:bg-orange-500/10 focus:text-orange-600 transition-all font-medium">
                                    <Settings className="h-4 w-4" />
                                    <span>Notifications</span>
                                </DropdownMenuItem>

                                <div className="h-px bg-slate-100 dark:bg-white/5 my-1.5" />

                                <DropdownMenuItem
                                    onClick={() => logout()}
                                    className="flex items-center gap-2 rounded-lg py-2.5 px-3 cursor-pointer text-rose-500 focus:bg-rose-500/10 focus:text-rose-600 transition-all font-bold"
                                >
                                    <LogOut className="h-4 w-4" />
                                    <span>Sign Out</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    )
}
