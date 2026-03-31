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
    Link2
} from "lucide-react";
import { Box, Typography } from "@mui/material"
import { cn } from "@/lib/utils"
import { useLogoutMutation } from "@/app/(auth)/login/services/use-auth-mutations"
import { STUDENT_FEATURE_FLAGS, StudentFeatureFlagKey } from "./studentFeatureFlags"
import { linkService } from "@/lib/api/services/linkService"
import { toast } from "react-toastify"
import { Copy, User2, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react"
import { useEffect } from "react"

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
    { icon: BookMarked, label: "Library", href: "/student/library", featureKey: "library", section: "advanced" },
    { icon: WalletCards, label: "Payments", href: "/student/payments", featureKey: "payments", section: "advanced" },
    { icon: Brain, label: "AI Study Assistant", href: "/student/ai-study", featureKey: "aiStudy", section: "advanced" },
    { icon: CalendarClock, label: "Timetable", href: "/student/timetable", featureKey: "timetable", section: "advanced" },
];

// Filter menu items based on feature flags and group by section
const getFilteredStudentMenuItemsBySection = () => {
    // This filters out disabled items completely
    const filtered = studentMenuItems.filter(item => STUDENT_FEATURE_FLAGS[item.featureKey]);

    const sections = {
        core: filtered.filter(item => item.section === 'core'),
        communication: filtered.filter(item => item.section === 'communication'),
        profile: filtered.filter(item => item.section === 'profile'),
        advanced: filtered.filter(item => item.section === 'advanced'),
    };

    return sections;
};

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

    useEffect(() => {
        linkService.getProfile().then(setProfile).catch(() => {})
    }, [])

    const copyCode = (code: string) => {
        navigator.clipboard.writeText(code)
        toast.success("Code copied to clipboard")
    }

    // Get filtered menu items grouped by section
    const menuSections = getFilteredStudentMenuItemsBySection()

    return (
        <Sidebar
            collapsible="icon"
            className={cn(
                "transition-all duration-300 ease-in-out",
                isCollapsed ? "w-[80px]" : "w-[260px]"
            )}
        >
            {/* Header */}
            <SidebarHeader className="pt-8 flex items-center justify-between px-4">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            className="flex items-center justify-between hover:bg-transparent cursor-default"
                            asChild
                        >
                            <Box className="flex items-center justify-start">
                                <Box className="flex items-center justify-center mr-3">
                                    <School className="h-5 w-5 shrink-0 text-blue-500" />
                                </Box>
                                {!isCollapsed && (
                                    <Link href="/" passHref>
                                        <Typography
                                            variant="h6"
                                            noWrap
                                            component="h2"
                                            sx={{
                                                fontFamily: "monospace",
                                                fontWeight: 700,
                                                letterSpacing: ".2rem",
                                                color: "inherit",
                                                textDecoration: "none",
                                            }}
                                        >
                                            SCHOOLHUB
                                        </Typography>
                                    </Link>
                                )}
                            </Box>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
                
                {/* Retractable Toggle Button */}
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        setIsCollapsed(!isCollapsed);
                    }}
                    className="absolute -right-4 top-10 z-[100] h-8 w-8 rounded-full border border-gray-200 bg-white dark:bg-gray-800 dark:border-gray-700 flex items-center justify-center shadow-xl text-gray-600 hover:text-blue-600 hover:scale-110 active:scale-95 transition-all"
                    title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                >
                    {isCollapsed ? (
                        <ChevronRight size={18} />
                    ) : (
                        <ChevronLeft size={18} />
                    )}
                </button>
            </SidebarHeader>

            {/* Main Menu */}
            <SidebarContent className="mt-10">
                <SidebarMenu>
                    {/* Render each section */}
                    {Object.entries(menuSections).map(([sectionKey, items]) => {
                        // This check ensures empty sections are not rendered
                        if (items.length === 0) return null;

                        return (
                            <div key={sectionKey} className="mb-6">
                                {/* Section Header (only show when not collapsed) */}
                                {!isCollapsed && (
                                    <div className="px-4 mb-2">
                                        <Typography
                                            variant="caption"
                                            className="text-xs font-semibold text-gray-500 uppercase tracking-wide"
                                        >
                                            {STUDENT_SECTION_TITLES[sectionKey as keyof typeof STUDENT_SECTION_TITLES]}
                                        </Typography>
                                    </div>
                                )}

                                {/* Section Items - ONLY filtered items appear here */}
                                {items.map(({ icon: Icon, label, href, featureKey }) => {
                                    const isActive = pathname === href;
                                    // Since items are already filtered, this should always be true
                                    const isDisabled = !STUDENT_FEATURE_FLAGS[featureKey];

                                    return (
                                        <SidebarMenuItem key={label} className="my-1">
                                            <Link href={href}>
                                                <SidebarMenuButton
                                                    className={cn(
                                                        "relative flex items-center gap-3 text-[1rem] font-medium rounded-lg px-4 py-3 transition-all",
                                                        isActive
                                                            ? "bg-accent text-accent-foreground shadow-sm cursor-pointer"
                                                            : "hover:bg-accent/40 cursor-pointer"
                                                    )}
                                                >
                                                    {isActive && (
                                                        <span className="absolute left-0 top-0 h-full w-[4px] bg-primary rounded-r-md" />
                                                    )}
                                                    <Icon className="h-5 w-5 shrink-0" />
                                                    {!isCollapsed && (
                                                        <span className="flex-1">{label}</span>
                                                    )}
                                                    {/* "Soon" badge is removed since disabled items don't appear */}
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
            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <DropdownMenu onOpenChange={setIsUserOpen}>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuButton className="flex items-center justify-between hover:bg-accent/60 transition-colors py-3 px-4 rounded-lg">
                                    <div className="flex items-center">
                                        <User2 className="mr-2 h-5 w-5" />
                                        {!isCollapsed && (
                                            <div className="flex flex-col items-start">
                                                <span className="font-medium text-[0.9rem] leading-none mb-1">{profile?.name || 'Student'}</span>
                                                {profile?.linkingCode && (
                                                    <span className="text-[10px] font-black text-primary tracking-widest leading-none bg-primary/10 px-1.5 py-0.5 rounded uppercase">
                                                        {profile.linkingCode}
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    {!isCollapsed &&
                                        (isUserOpen ? (
                                            <ChevronDown className="ml-auto h-4 w-4 opacity-70" />
                                        ) : (
                                            <ChevronUp className="ml-auto h-4 w-4 opacity-70" />
                                        ))}
                                </SidebarMenuButton>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent
                                side="top"
                                align="end"
                                className="w-[220px] rounded-lg shadow-lg border border-border bg-background p-1"
                            >
                                {profile?.linkingCode && (
                                    <DropdownMenuItem 
                                        onClick={() => copyCode(profile.linkingCode)}
                                        className="cursor-pointer hover:bg-accent/60 rounded-md font-black text-xs p-3 justify-between"
                                    >
                                        <div className="flex flex-col">
                                            <span className="text-gray-400 uppercase tracking-widest text-[10px]">Your Code</span>
                                            <span className="text-primary tracking-widest">{profile.linkingCode}</span>
                                        </div>
                                        <Copy className="h-4 w-4 text-gray-400" />
                                    </DropdownMenuItem>
                                )}
                                <DropdownMenuItem className="cursor-pointer hover:bg-accent/60 rounded-md">
                                    My Profile
                                </DropdownMenuItem>
                                <DropdownMenuItem className="cursor-pointer hover:bg-accent/60 rounded-md">
                                    Academic Progress
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => logout()} className="cursor-pointer hover:bg-accent/60 rounded-md text-destructive">
                                    Sign out
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    )
}