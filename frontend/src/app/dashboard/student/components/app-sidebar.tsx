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
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    LayoutDashboard,
    BookOpenCheck,
    ClipboardList,
    BarChart3,
    CalendarDays,
    MessageCircle,
    BellRing,
    UserCircle,
    Settings,
    LifeBuoy,
    FileCheck2,
    BookMarked,
    WalletCards,
    Brain,
    CalendarClock,
    School,
    LucideIcon,
    FileText,
    Link2,
    CreditCard
} from "lucide-react";
import { Box, Typography } from "@mui/material"
import { cn } from "@/lib/utils"
import { useLogoutMutation } from "@/app/(auth)/login/services/use-auth-mutations"
import { STUDENT_FEATURE_FLAGS, StudentFeatureFlagKey } from "./studentFeatureFlags"
import { useGlobalFeatures } from "@/lib/api/hooks/useGlobalFeatures"
import { linkService } from "@/lib/api/services/linkService"
import { toast } from "react-toastify"
import { Copy, User2, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, LogOut } from "lucide-react"
import { useEffect, useMemo } from "react"

// Define the menu item type
interface StudentMenuItem {
    icon: LucideIcon;
    label: string;
    href: string;
    featureKey: StudentFeatureFlagKey;
    section?: string;
}

// Complete student menu items with feature keys and sections
export const studentMenuItems: StudentMenuItem[] = [
    // === CORE FEATURES ===
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard/student", featureKey: "dashboard", section: "core" },
    { icon: BookOpenCheck, label: "Classes", href: "/dashboard/student/my-classes", featureKey: "classes", section: "core" },
    { icon: ClipboardList, label: "Assignments", href: "/dashboard/student/assignments", featureKey: "assignments", section: "core" },
    { icon: BarChart3, label: "Grades", href: "/dashboard/student/grades", featureKey: "results", section: "core" },
    { icon: FileCheck2, label: "Exams/Quizzes", href: "/dashboard/student/exams&quizzes", featureKey: "exams", section: "core" },
    { icon: CalendarDays, label: "Attendance", href: "/dashboard/student/attendance", featureKey: "attendance", section: "core" },
    { icon: FileText, label: "Documents", href: "/dashboard/student/documents", featureKey: "documents", section: "core" },


    // === COMMUNICATION ===
    { icon: MessageCircle, label: "Messages", href: "/student/messages", featureKey: "messages", section: "communication" },
    { icon: Link2, label: "Linking Hub", href: "/dashboard/student/linking", featureKey: "linking", section: "communication" },
    { icon: BellRing, label: "Notifications", href: "/dashboard/student/notifications", featureKey: "notifications", section: "communication" },

    // === PROFILE & SETTINGS ===
    { icon: UserCircle, label: "Profile", href: "/dashboard/student/profile", featureKey: "profile", section: "profile" },
    { icon: Settings, label: "Settings", href: "/dashboard/student/settings", featureKey: "settings", section: "profile" },
    { icon: LifeBuoy, label: "Support", href: "/dashboard/student/support", featureKey: "support", section: "profile" },

    // === OPTIONAL/ADVANCED FEATURES ===
    { icon: CreditCard, label: "Subscription", href: "/dashboard/student/billing", featureKey: "billing", section: "profile" },
    { icon: Brain, label: "AI Study Assistant", href: "/student/ai-study", featureKey: "aiStudy", section: "advanced" },
    { icon: CalendarClock, label: "Timetable", href: "/student/timetable", featureKey: "timetable", section: "advanced" },
];

// Section titles
const STUDENT_SECTION_TITLES = {
    core: "Learning",
    communication: "Communication",
    profile: "Account",
    advanced: "More Tools"
};

interface StudentSidebarProps {
    isCollapsed: boolean;
    setIsCollapsed: (collapsed: boolean) => void;
}

export function StudentSidebar({ isCollapsed, setIsCollapsed }: StudentSidebarProps) {
    const { mutate: logout } = useLogoutMutation()
    const [isUserOpen, setIsUserOpen] = useState(false)
    const [profile, setProfile] = useState<any>(null)
    const pathname = usePathname()

    // Fetch dynamic feature toggles from platform config
    const { data: dynamicFeatures, isLoading: isFeaturesLoading } = useGlobalFeatures('student')

    useEffect(() => {
        linkService.getProfile().then(setProfile).catch(() => {})
    }, [])

    const copyCode = (code: string) => {
        navigator.clipboard.writeText(code)
        toast.success("Code copied to clipboard")
    }

    // Get filtered menu items grouped by section based on dynamic or static flags
    const menuSections = useMemo(() => {
        if (isFeaturesLoading) return null;
        
        const currentFeatures = dynamicFeatures || STUDENT_FEATURE_FLAGS;
        
        const filtered = studentMenuItems.filter(item => {
            // Map 'results' to 'grades' for consistency with schema/seed
            const key = item.featureKey === 'results' ? 'grades' : item.featureKey;
            return !!(currentFeatures as any)[key];
        });

        return {
            core: filtered.filter(item => item.section === 'core'),
            communication: filtered.filter(item => item.section === 'communication'),
            profile: filtered.filter(item => item.section === 'profile'),
            advanced: filtered.filter(item => item.section === 'advanced'),
        };
    }, [dynamicFeatures, isFeaturesLoading]);

    return (
        <Sidebar
            collapsible="icon"
            className={cn(
                "transition-all duration-300 ease-in-out border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-0",
                isCollapsed ? "w-[64px]" : "w-[260px]"
            )}
        >
            {/* Header */}
            <SidebarHeader className="pt-8 flex items-center justify-between px-4 relative">
                <Link href="/" className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-white/10 p-1.5 transition-transform duration-500 group-hover:scale-105">
                        <img src="/logo/favicon.svg" alt="Qefas Hub" className="h-full w-full object-contain" />
                    </div>
                    {!isCollapsed && (
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-slate-900 dark:text-white tracking-tight uppercase">QEFAS HUB</span>
                            <span className="text-[10px] text-pink-500 font-bold uppercase tracking-widest">Student Portal</span>
                        </div>
                    )}
                </Link>
                
                {/* Retractable Toggle Button */}
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        setIsCollapsed(!isCollapsed);
                    }}
                    className="absolute -right-3 top-20 z-50 h-6 w-6 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-400 hover:text-pink-500 dark:hover:text-pink-400 flex items-center justify-center transition-all shadow-sm group"
                    title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                >
                    {isCollapsed ? (
                        <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                    ) : (
                        <ChevronLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
                    )}
                </button>
            </SidebarHeader>

            {/* Main Menu */}
            <SidebarContent className="mt-10 px-2 flex-1 outline-none">
                <SidebarMenu>
                    {isFeaturesLoading ? (
                        <div className="flex flex-col gap-3 px-1 mt-2">
                            {Array.from({ length: 10 }).map((_, i) => (
                                <div key={i} className="flex items-center gap-3 h-10 px-3">
                                    <div className="h-5 w-5 rounded-md bg-slate-100 dark:bg-white/5 animate-pulse shrink-0" />
                                    {!isCollapsed && (
                                        <div className="h-4 w-3/4 rounded-md bg-slate-100 dark:bg-white/5 animate-pulse" />
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        /* Render each section */
                        menuSections && Object.entries(menuSections).map(([sectionKey, items]) => {
                        if (items.length === 0) return null;

                        return (
                            <div key={sectionKey} className="mb-6">
                                {/* Section Header */}
                                {!isCollapsed && (
                                    <div className="px-4 mb-2">
                                        <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">
                                            {STUDENT_SECTION_TITLES[sectionKey as keyof typeof STUDENT_SECTION_TITLES]}
                                        </span>
                                    </div>
                                )}

                                {items.map(({ icon: Icon, label, href }) => {
                                    const isActive = pathname === href;

                                    return (
                                        <SidebarMenuItem key={label} className="my-1">
                                            <Link href={href}>
                                                <SidebarMenuButton
                                                    className={cn(
                                                        "flex items-center gap-3 rounded-xl px-3 py-6 transition-all duration-200 group relative cursor-pointer",
                                                        isActive
                                                            ? "bg-pink-600/10 text-pink-600 dark:text-pink-400 shadow-sm shadow-pink-600/5"
                                                            : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/[0.02] hover:text-slate-900 dark:hover:text-slate-100"
                                                    )}
                                                >
                                                    <Icon className={cn(
                                                        "h-5 w-5 transition-transform group-hover:scale-110",
                                                        isActive ? "text-pink-500" : "text-slate-400"
                                                    )} />
                                                    {!isCollapsed && (
                                                        <span className={cn(
                                                            "font-semibold tracking-tight",
                                                            isActive ? "text-pink-600 dark:text-pink-400" : ""
                                                        )}>{label}</span>
                                                    )}
                                                    {isActive && (
                                                        <div className="absolute right-2 h-1.5 w-1.5 rounded-full bg-pink-500 shadow-lg shadow-pink-500/50" />
                                                    )}
                                                </SidebarMenuButton>
                                            </Link>
                                        </SidebarMenuItem>
                                    );
                                })}
                            </div>
                        );
                    }))}
                </SidebarMenu>
            </SidebarContent>

            {/* Footer */}
            <SidebarFooter className="p-4 bg-transparent">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <DropdownMenu onOpenChange={setIsUserOpen}>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuButton className="flex items-center gap-3 p-3 h-auto rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 hover:border-pink-500/30 transition-all group cursor-pointer">
                                    <div className="h-10 w-10 rounded-lg bg-pink-600/10 dark:bg-pink-600/20 flex items-center justify-center border border-pink-500/20 overflow-hidden shrink-0">
                                        {profile?.profileImage ? (
                                            <img src={profile.profileImage} alt={profile.name} className="h-full w-full object-cover" />
                                        ) : (
                                            <div className="h-full w-full bg-pink-600 flex items-center justify-center">
                                                <User2 className="h-6 w-6 text-white/60" />
                                            </div>
                                        )}
                                    </div>
                                    {!isCollapsed && (
                                        <div className="flex flex-col items-start flex-1 overflow-hidden">
                                            <span className="font-black text-xs text-slate-900 dark:text-white truncate leading-tight uppercase tracking-tight">{profile?.name || 'Student'}</span>
                                            {profile?.linkingCode && (
                                                <span className="text-[9px] font-black text-pink-500 uppercase tracking-[0.15em] mt-1">
                                                    ID: {profile.linkingCode}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                    {!isCollapsed && (
                                        <div className="text-slate-400 group-hover:text-pink-400 transition-colors">
                                            {isUserOpen ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
                                        </div>
                                    )}
                                </SidebarMenuButton>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent
                                side="right"
                                align="end"
                                className="w-[220px] rounded-2xl shadow-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 ml-2"
                            >
                                {profile?.linkingCode && (
                                    <DropdownMenuItem 
                                        onClick={() => copyCode(profile.linkingCode)}
                                        className="cursor-pointer hover:bg-pink-500/10 rounded-xl font-bold text-xs p-4 flex flex-col items-start gap-1 group"
                                    >
                                        <span className="text-[10px] text-slate-400 uppercase tracking-widest font-black">Quick Link Code</span>
                                        <div className="flex items-center justify-between w-full">
                                            <span className="text-pink-500 tracking-[0.2em] font-black text-base">{profile.linkingCode}</span>
                                            <Copy size={16} className="text-slate-400 group-hover:text-pink-500 transition-colors" />
                                        </div>
                                    </DropdownMenuItem>
                                )}
                                <div className="h-[1px] bg-slate-200 dark:bg-slate-800 my-2 mx-2" />
                                <DropdownMenuItem className="rounded-xl py-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5 font-medium text-slate-600 dark:text-slate-300">
                                    <User2 className="mr-3 h-4 w-4" /> My Profile
                                </DropdownMenuItem>
                                <DropdownMenuItem className="rounded-xl py-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5 font-medium text-slate-600 dark:text-slate-300">
                                    <BarChart3 className="mr-3 h-4 w-4" /> Academic Progress
                                </DropdownMenuItem>
                                <div className="h-[1px] bg-slate-200 dark:bg-slate-800 my-2 mx-2" />
                                <DropdownMenuItem onClick={() => logout()} className="rounded-xl py-3 cursor-pointer hover:bg-red-500/10 font-bold text-red-500">
                                    <LogOut size={16} className="mr-3" /> Sign out
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    )
}

