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
    LucideIcon
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
    { icon: CalendarDays, label: "Attendance", href: "/parent/attendance", featureKey: "attendance", section: "core" },

    // === MONITORING & COMMUNICATION ===
    { icon: Award, label: "Behavior & Remarks", href: "/parent/behavior", featureKey: "behavior", section: "monitoring" },
    { icon: MessageSquare, label: "Messages", href: "/parent/messages", featureKey: "messages", section: "monitoring" },
    { icon: BellRing, label: "Notifications", href: "/parent/notifications", featureKey: "notifications", section: "monitoring" },

    // === FINANCIAL & RESOURCES ===
    { icon: WalletCards, label: "Payments", href: "/parent/payments", featureKey: "payments", section: "financial" },
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

interface ParentSidebarProps {
    isCollapsed: boolean;
    setIsCollapsed: (collapsed: boolean) => void;
}

export function ParentSidebar({ isCollapsed, setIsCollapsed }: ParentSidebarProps) {
    const { mutate: logout } = useLogoutMutation()
    const [isUserOpen, setIsUserOpen] = useState(false)
    const pathname = usePathname()

    // Get filtered menu items grouped by section
    const menuSections = getFilteredParentMenuItemsBySection()

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
                                            {PARENT_SECTION_TITLES[sectionKey as keyof typeof PARENT_SECTION_TITLES]}
                                        </Typography>
                                    </div>
                                )}

                                {/* Section Items */}
                                {items.map(({ icon: Icon, label, href, featureKey }) => {
                                    const isActive = pathname === href;
                                    const isDisabled = !PARENT_FEATURE_FLAGS[featureKey];

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
                                            <span className="font-medium text-[1rem]">Parent</span>
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
                                    Family Profile
                                </DropdownMenuItem>
                                <DropdownMenuItem className="cursor-pointer hover:bg-accent/60 rounded-md">
                                    Payment History
                                </DropdownMenuItem>
                                <DropdownMenuItem className="cursor-pointer hover:bg-accent/60 rounded-md">
                                    Notification Settings
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