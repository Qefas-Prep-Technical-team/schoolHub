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
    CalendarDays,
    BarChart3,
    Users,
    MessageSquare,
    BellRing,
    Settings,
    UserCircle,
    LifeBuoy,
    FileCheck2,
    BookMarked,
    Brain,
    CalendarClock,
    Award,
    School,
    User2,
    ChevronUp,
    ChevronDown,
    LucideIcon
} from "lucide-react";
import { Box, Typography } from "@mui/material"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { useLogoutMutation } from "@/app/(auth)/login/services/use-auth-mutations"
import { FEATURE_FLAGS_TEACHERS, FeatureTeacherFlagKey } from "@/lib/config/featureFlags"

// Define the menu item type
interface MenuItem {
    icon: LucideIcon;
    label: string;
    href: string;
    featureKey: FeatureTeacherFlagKey;
}

// Complete menu items with feature keys
export const menuItems: MenuItem[] = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/teacher/dashboard", featureKey: "dashboard" },
    { icon: BookOpenCheck, label: "My Classes", href: "/teacher/classes", featureKey: "classes" },
    { icon: ClipboardList, label: "Assignments", href: "/teacher/assignments", featureKey: "assignments" },
    { icon: FileCheck2, label: "Exams/Quizzes", href: "/teacher/exams", featureKey: "exams" },
    { icon: CalendarDays, label: "Attendance", href: "/teacher/attendance", featureKey: "attendance" },
    { icon: Award, label: "Grades", href: "/teacher/grades", featureKey: "grades" },
    { icon: Users, label: "Students", href: "/teacher/students", featureKey: "students" },
    { icon: MessageSquare, label: "Messages", href: "/teacher/messages", featureKey: "messages" },
    { icon: BellRing, label: "Notifications", href: "/teacher/notifications", featureKey: "notifications" },
    { icon: BarChart3, label: "Reports", href: "/teacher/reports", featureKey: "reports" },
    { icon: BookMarked, label: "Resources", href: "/teacher/resources", featureKey: "resources" },
    { icon: Brain, label: "AI Assistant", href: "/teacher/ai-tools", featureKey: "aiTools" },
    { icon: CalendarClock, label: "Timetable", href: "/teacher/timetable", featureKey: "timetable" },
    { icon: UserCircle, label: "Profile", href: "/teacher/profile", featureKey: "profile" },
    { icon: Settings, label: "Settings", href: "/teacher/settings", featureKey: "settings" },
    { icon: LifeBuoy, label: "Support", href: "/teacher/support", featureKey: "support" },
];

// Filter menu items based on feature flags
const getFilteredMenuItems = (): MenuItem[] => {
    return menuItems.filter(item => FEATURE_FLAGS_TEACHERS[item.featureKey]);
};

interface AppSidebarProps {
    isCollapsed: boolean;
    setIsCollapsed: (collapsed: boolean) => void;
}

export function AppSidebar({ isCollapsed, setIsCollapsed }: AppSidebarProps) {
    const { mutate: logout } = useLogoutMutation()
    const [isUserOpen, setIsUserOpen] = useState(false)
    const pathname = usePathname()

    // Get filtered menu items based on feature flags
    const filteredMenuItems = getFilteredMenuItems()

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
                    {filteredMenuItems.map(({ icon: Icon, label, href }) => {
                        const isActive = pathname === href
                        return (
                            <SidebarMenuItem key={label} className="my-2">
                                <Link href={href}>
                                    <SidebarMenuButton
                                        className={cn(
                                            "relative flex items-center gap-3 text-[1rem] font-medium rounded-lg px-4 py-3 transition-all cursor-pointer",
                                            isActive
                                                ? "bg-accent text-accent-foreground shadow-sm"
                                                : "hover:bg-accent/40"
                                        )}
                                    >
                                        {isActive && (
                                            <span className="absolute left-0 top-0 h-full w-[4px] bg-primary rounded-r-md" />
                                        )}
                                        <Icon className="h-5 w-5 shrink-0" />
                                        {!isCollapsed && <span>{label}</span>}
                                    </SidebarMenuButton>
                                </Link>
                            </SidebarMenuItem>
                        )
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
                                            <span className="font-medium text-[1rem]">Username</span>
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
                                    Account
                                </DropdownMenuItem>
                                <DropdownMenuItem className="cursor-pointer hover:bg-accent/60 rounded-md">
                                    Billing
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