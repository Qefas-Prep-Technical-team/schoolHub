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
    BookOpenCheck,
    ClipboardList,
    CalendarDays,
    BarChart3,
    Users,
    MessageSquare,
    BellRing,
    Settings,
    UserCircle,
    LifeBuoy,
    FileCheck2,
    FileText,
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
    Share2,
    LucideIcon,
    Loader2,
    CreditCard
} from "lucide-react";
import { useTeacherProfile } from "@/lib/api/hooks/useTeacher"
import { Box, Typography } from "@mui/material"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { useLogoutMutation } from "@/app/(auth)/login/services/use-auth-mutations"
import { FEATURE_FLAGS_TEACHERS, FeatureTeacherFlagKey } from "@/lib/config/featureFlags"
import { useGlobalFeatures } from "@/lib/api/hooks/useGlobalFeatures"
import { linkService } from "@/lib/api/services/linkService"
import { toast } from "react-toastify"
import { useEffect, useMemo } from "react"

// Define the menu item type
interface MenuItem {
    icon: LucideIcon;
    label: string;
    href: string;
    featureKey: FeatureTeacherFlagKey;
}

// Corrected menu items with feature keys
export const menuGroups = [
    {
        label: "Primary",
        items: [
            { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard/teacher", featureKey: "dashboard" },
            { icon: Users, label: "Students", href: "/dashboard/teacher/students", featureKey: "students" },
            { icon: User2, label: "Parents", href: "/dashboard/teacher/parents", featureKey: "parents" },
            { icon: BookOpenCheck, label: "My Classes", href: "/dashboard/teacher/my-classes", featureKey: "classes" },
        ]
    },
    {
        label: "Academic",
        items: [
            { icon: ClipboardList, label: "Assignments", href: "/dashboard/teacher/assignments", featureKey: "assignments" },
            { icon: Award, label: "Grades", href: "/dashboard/teacher/grades", featureKey: "grades" },
            { icon: FileCheck2, label: "Exams & Quizzes", href: "/dashboard/teacher/exams&quizzes", featureKey: "exams" },
            { icon: CalendarClock, label: "Timetable", href: "/dashboard/teacher/timetable", featureKey: "timetable" },
            { icon: BarChart3, label: "Performance Reports", href: "/dashboard/teacher/reports", featureKey: "reports" },
        ]
    },
    {
        label: "Ecosystem",
        items: [
            { icon: Share2, label: "Linking Hub", href: "/dashboard/teacher/linking", featureKey: "linking" },
            { icon: Brain, label: "AI Tools", href: "/dashboard/teacher/ai-tools", featureKey: "aiTools" },
            { icon: BookMarked, label: "Resources", href: "/dashboard/teacher/resources", featureKey: "resources" },
            { icon: FileText, label: "Documents", href: "/dashboard/teacher/documents", featureKey: "documents" },
        ]
    },
    {
        label: "Communication",
        items: [
            { icon: MessageSquare, label: "Messages", href: "/dashboard/teacher/messages", featureKey: "messages" },
            { icon: BellRing, label: "Notifications", href: "/dashboard/teacher/notifications", featureKey: "notifications" },
        ]
    },
    {
        label: "Account",
        items: [
            { icon: UserCircle, label: "My Profile", href: "/dashboard/teacher/profile", featureKey: "profile" },
            { icon: CreditCard, label: "Subscription", href: "/dashboard/teacher/billing", featureKey: "billing" },
            { icon: Settings, label: "System Settings", href: "/dashboard/teacher/settings", featureKey: "settings" },
            { icon: LifeBuoy, label: "Help & Support", href: "/dashboard/teacher/support", featureKey: "support" },
        ]
    }
];

export function AppSidebar() {
    const { state, toggleSidebar } = useSidebar()
    const isCollapsed = state === "collapsed"
    const { mutate: logout } = useLogoutMutation()
    const [isUserOpen, setIsUserOpen] = useState(false)
    const { data: profile } = useTeacherProfile()
    const pathname = usePathname()

    // Fetch dynamic feature toggles from platform config
    const { data: dynamicFeatures, isLoading: isFeaturesLoading } = useGlobalFeatures('teacher')

    const copyCode = (code: string) => {
        navigator.clipboard.writeText(code)
        toast.success("Code copied to clipboard")
    }

    // Get the current features configuration
    const currentFeatures = useMemo(() => {
        if (isFeaturesLoading) return null;
        return dynamicFeatures || FEATURE_FLAGS_TEACHERS;
    }, [dynamicFeatures, isFeaturesLoading]);

    return (
        <Sidebar
            collapsible="icon"
            className="border-r border-slate-200 dark:border-white/5 bg-white dark:bg-slate-950 transition-all duration-300 ease-in-out"
        >
            {/* Header */}
            <SidebarHeader className="h-20 flex flex-row items-center justify-between px-4 border-b border-slate-100 dark:border-white/5 relative text-inherit">
                <Link href="/" className="flex items-center gap-3 overflow-hidden">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-white/10 p-1.5 transition-transform duration-500 group-hover:scale-105">
                        <img src="/logo/favicon.svg" alt="Qefas Hub" className="h-full w-full object-contain" />
                    </div>
                    {!isCollapsed && (
                        <div className="flex flex-col leading-none transition-all duration-300">
                            <span className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">QEFAS HUB</span>
                            <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest mt-0.5">Teacher Hub</span>
                        </div>
                    )}
                </Link>

                {/* Floating Absolute Toggle Button */}
                <button
                    onClick={toggleSidebar}
                    className="absolute -right-3 top-7 h-6 w-6 rounded-full border border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-800 flex items-center justify-center shadow-md hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-all z-50 group hover:scale-110 active:scale-95"
                    aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                    {isCollapsed ? (
                        <ChevronRight className="h-3.5 w-3.5 text-emerald-600" />
                    ) : (
                        <ChevronLeft className="h-3.5 w-3.5 text-emerald-600" />
                    )}
                </button>
            </SidebarHeader>

            {/* Main Menu */}
            <SidebarContent className="py-6 px-3 custom-scrollbar flex flex-col gap-6">
                {isFeaturesLoading ? (
                    <div className="flex flex-col gap-3 px-1 mt-2">
                        {Array.from({ length: 12 }).map((_, i) => (
                            <div key={i} className="flex items-center gap-3 h-10 px-3">
                                <div className="h-5 w-5 rounded-md bg-slate-100 dark:bg-white/5 animate-pulse shrink-0" />
                                {!isCollapsed && (
                                    <div className="h-4 w-3/4 rounded-md bg-slate-100 dark:bg-white/5 animate-pulse" />
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    menuGroups.map((group) => (
                    <div key={group.label} className="space-y-2">
                        {!isCollapsed && (
                            <h3 className="px-3 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-3">
                                {group.label}
                            </h3>
                        )}
                        <SidebarMenu className="gap-1.5 font-inherit">
                            {group.items.map(({ icon: Icon, label, href, featureKey }) => {
                                const isEnabled = !!(currentFeatures as any)[featureKey];
                                const isActive = pathname === href;

                                // If feature is disabled, don't render it at all
                                if (!isEnabled) return null;
                                
                                return (
                                    <SidebarMenuItem key={label}>
                                        <Link 
                                            href={href} 
                                            className="w-full"
                                        >
                                            <SidebarMenuButton
                                                className={cn(
                                                    "relative flex items-center gap-3 h-11 px-3 rounded-xl transition-all duration-200 group overflow-hidden",
                                                    isActive
                                                        ? "bg-emerald-600/10 text-emerald-600 dark:text-emerald-400 font-bold shadow-[0_4px_12px_rgba(5,150,105,0.1)]"
                                                        : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white",
                                                )}
                                            >
                                                {isActive && (
                                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-emerald-600 rounded-r-full shadow-[2px_0_8px_rgba(5,150,105,0.6)]" />
                                                )}
                                                <Icon className={cn(
                                                    "h-5 w-5 transition-all duration-300 group-hover:scale-110",
                                                    isActive ? "text-emerald-600 dark:text-emerald-400" : "group-hover:text-emerald-500",
                                                )} />
                                                {!isCollapsed && (
                                                    <span className="text-[13.5px] tracking-tight truncate flex-1">{label}</span>
                                                )}
                                                
                                                {!isCollapsed && !isActive && (
                                                    <div className="absolute right-2 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0">
                                                        <ChevronRight className="h-3.5 w-3.5 text-emerald-500/50" />
                                                    </div>
                                                )}
                                            </SidebarMenuButton>
                                        </Link>
                                    </SidebarMenuItem>
                                )
                            })}
                        </SidebarMenu>
                    </div>
                )))}
            </SidebarContent>

            {/* Footer */}
            <SidebarFooter className="p-3 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02]">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <DropdownMenu onOpenChange={setIsUserOpen}>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuButton className={cn(
                                    "flex items-center gap-2.5 h-14 w-full rounded-2xl transition-all duration-300 px-2 py-2 group cursor-pointer",
                                    isUserOpen ? "bg-white dark:bg-slate-900 shadow-lg ring-1 ring-emerald-500/20" : "hover:bg-white dark:hover:bg-white/5 shadow-sm border border-transparent hover:border-slate-200 dark:hover:border-white/10"
                                )}>
                                    <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-xl ring-2 ring-emerald-500/10 group-hover:ring-emerald-500/30 transition-all duration-500">
                                        {profile?.profileImage ? (
                                            <img src={profile.profileImage} alt="Profile" className="h-full w-full object-cover" />
                                        ) : (
                                            <div className="h-full w-full bg-emerald-600 flex items-center justify-center text-white">
                                                <User2 className="h-5 w-5" />
                                            </div>
                                        )}
                                    </div>

                                    {!isCollapsed && (
                                        <div className="flex flex-col items-start min-w-0 flex-1">
                                            <span className="font-bold text-xs text-slate-900 dark:text-white leading-none truncate w-full">{profile?.name || 'Teacher'}</span>
                                            {profile?.linkingCode && (
                                                <div className="flex items-center gap-1 mt-1 shrink-0">
                                                    <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 tracking-widest leading-none bg-emerald-500/10 px-1.5 py-0.5 rounded uppercase">
                                                        {profile.linkingCode}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {!isCollapsed && (
                                        <div className={cn("transition-transform duration-500 ml-auto mr-1", isUserOpen ? "rotate-180" : "")}>
                                            <ChevronDown className="h-3.5 w-3.5 text-slate-400 group-hover:text-emerald-500" />
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
                                {profile?.linkingCode && (
                                    <div className="px-3 py-3 mb-2 rounded-xl bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/10 flex items-center justify-between group/code">
                                        <div className="flex flex-col gap-0.5">
                                            <span className="text-[9px] font-black text-emerald-600/50 dark:text-emerald-400/50 uppercase tracking-widest">Link Code</span>
                                            <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 tracking-widest font-mono lowercase">{profile.linkingCode}</span>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 rounded-lg hover:bg-emerald-500/20 text-emerald-600"
                                            onClick={() => copyCode(profile.linkingCode)}
                                            title="Copy Code"
                                        >
                                            <Copy className="h-3.5 w-3.5" />
                                        </Button>
                                    </div>
                                )}

                                <DropdownMenuItem className="flex items-center gap-2 rounded-lg py-2.5 px-3 cursor-pointer text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 focus:bg-emerald-500/10 focus:text-emerald-600 transition-all font-medium">
                                    <User2 className="h-4 w-4" />
                                    <span>Account Settings</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="flex items-center gap-2 rounded-lg py-2.5 px-3 cursor-pointer text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 focus:bg-emerald-500/10 focus:text-emerald-600 transition-all font-medium">
                                    <CreditCard className="h-4 w-4" />
                                    <span>Subscription</span>
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
