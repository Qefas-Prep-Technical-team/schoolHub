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
    User2,
    ChevronUp,
    ChevronDown,
    LucideIcon
} from "lucide-react";
import { Box, Typography } from "@mui/material"
import { cn } from "@/lib/utils"
import { useLogoutMutation } from "@/app/(auth)/login/services/use-auth-mutations"
import { STUDENT_FEATURE_FLAGS, StudentFeatureFlagKey } from "./studentFeatureFlags"


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
    { icon: LayoutDashboard, label: "Dashboard", href: "/student/dashboard", featureKey: "dashboard", section: "core" },
    { icon: BookOpenCheck, label: "Classes", href: "/student/classes", featureKey: "classes", section: "core" },
    { icon: ClipboardList, label: "Assignments", href: "/student/assignments", featureKey: "assignments", section: "core" },
    { icon: BarChart3, label: "Results", href: "/student/results", featureKey: "results", section: "core" },
    { icon: CalendarDays, label: "Attendance", href: "/student/attendance", featureKey: "attendance", section: "core" },
    
    // === COMMUNICATION ===
    { icon: MessageCircle, label: "Messages", href: "/student/messages", featureKey: "messages", section: "communication" },
    { icon: BellRing, label: "Notifications", href: "/student/notifications", featureKey: "notifications", section: "communication" },
    
    // === PROFILE & SETTINGS ===
    { icon: UserCircle, label: "Profile", href: "/student/profile", featureKey: "profile", section: "profile" },
    { icon: Settings, label: "Settings", href: "/student/settings", featureKey: "settings", section: "profile" },
    { icon: LifeBuoy, label: "Support", href: "/student/support", featureKey: "support", section: "profile" },

    // === OPTIONAL/ADVANCED FEATURES ===
    { icon: FileCheck2, label: "Exams", href: "/student/exams", featureKey: "exams", section: "advanced" },
    { icon: BookMarked, label: "Library", href: "/student/library", featureKey: "library", section: "advanced" },
    { icon: WalletCards, label: "Payments", href: "/student/payments", featureKey: "payments", section: "advanced" },
    { icon: Brain, label: "AI Study Assistant", href: "/student/ai-study", featureKey: "aiStudy", section: "advanced" },
    { icon: CalendarClock, label: "Timetable", href: "/student/timetable", featureKey: "timetable", section: "advanced" },
];

// Filter menu items based on feature flags and group by section
const getFilteredStudentMenuItemsBySection = () => {
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
    const pathname = usePathname()
    
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
            </SidebarHeader>

            {/* Main Menu */}
            <SidebarContent className="mt-10">
                <SidebarMenu>
                    {/* Render each section */}
                    {Object.entries(menuSections).map(([sectionKey, items]) => {
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

                                {/* Section Items */}
                                {items.map(({ icon: Icon, label, href, featureKey }) => {
                                    const isActive = pathname === href;
                                    const isDisabled = !STUDENT_FEATURE_FLAGS[featureKey];

                                    return (
                                        <SidebarMenuItem key={label} className="my-1">
                                            <Link href={isDisabled ? "#" : href}>
                                                <SidebarMenuButton
                                                    className={cn(
                                                        "relative flex items-center gap-3 text-[1rem] font-medium rounded-lg px-4 py-3 transition-all",
                                                        isDisabled 
                                                            ? "text-gray-400 cursor-not-allowed opacity-60" 
                                                            : isActive
                                                                ? "bg-accent text-accent-foreground shadow-sm cursor-pointer"
                                                                : "hover:bg-accent/40 cursor-pointer"
                                                    )}
                                                    disabled={isDisabled}
                                                >
                                                    {isActive && !isDisabled && (
                                                        <span className="absolute left-0 top-0 h-full w-[4px] bg-primary rounded-r-md" />
                                                    )}
                                                    <Icon className="h-5 w-5 shrink-0" />
                                                    {!isCollapsed && (
                                                        <span className="flex-1">{label}</span>
                                                    )}
                                                    {isDisabled && !isCollapsed && (
                                                        <span className="text-xs bg-gray-200 text-gray-500 px-2 py-1 rounded">
                                                            Soon
                                                        </span>
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
            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <DropdownMenu onOpenChange={setIsUserOpen}>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuButton className="flex items-center justify-between hover:bg-accent/60 transition-colors py-3 px-4 rounded-lg">
                                    <div className="flex items-center">
                                        <User2 className="mr-2 h-5 w-5" />
                                        {!isCollapsed && (
                                            <span className="font-medium text-[1rem]">Student</span>
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