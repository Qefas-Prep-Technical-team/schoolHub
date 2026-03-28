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
    Building2,
    Users,
    GraduationCap,
    CalendarDays,
    Award,
    BookOpenCheck,
    CheckSquare,
    LibraryBig,
    CreditCard,
    WalletCards,
    BarChart3,
    MessageSquare,
    Landmark,
    BrainCircuit,
    Workflow,
    Settings,
    School,
    User2,
    ChevronUp,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    LucideIcon
} from "lucide-react";
import { Box, Typography } from "@mui/material"
import { cn } from "@/lib/utils"
import { useLogoutMutation } from "@/app/(auth)/login/services/use-auth-mutations"
import { ADMIN_FEATURE_FLAGS, AdminFeatureFlagKey } from "./adminFeatureFlags"
import { linkService } from "@/lib/api/services/linkService"
import { toast } from "react-toastify"
import { Copy } from "lucide-react"
import { useEffect } from "react"


// Define the menu item type
interface AdminMenuItem {
    icon: LucideIcon;
    label: string;
    href: string;
    featureKey: AdminFeatureFlagKey;
    section?: string;
}

// Complete admin menu items with feature keys and sections
export const adminMenuItems: AdminMenuItem[] = [
    // === CORE MANAGEMENT ===
    { icon: LayoutDashboard, label: "Overview", href: "/dashboard/admin", featureKey: "overview", section: "core" },
    { icon: Building2, label: "School Profile", href: "/dashboard/admin/school-profile", featureKey: "schoolProfile", section: "core" },
    { icon: Users, label: "Teachers", href: "/dashboard/admin/teachers", featureKey: "teachers", section: "core" },
    { icon: GraduationCap, label: "Students", href: "/dashboard/admin/students", featureKey: "students", section: "core" },
    { icon: CalendarDays, label: "Classes & Timetable", href: "/dashboard/admin/classes", featureKey: "classes", section: "core" },
    { icon: BrainCircuit, label: "Linking Hub", href: "/dashboard/admin/linking", featureKey: "linkingHub", section: "core" },
    { icon: CalendarDays, label: "Session Management", href: "/dashboard/admin/sessions", featureKey: "sessions", section: "core" },

    // === ACADEMICS ===
    { icon: Award, label: "Grades", href: "/dashboard/admin/grades", featureKey: "grades", section: "academics" },
    { icon: BookOpenCheck, label: "Exam Setup", href: "/dashboard/admin/exams", featureKey: "exams", section: "academics" },
    { icon: BookOpenCheck, label: "Subjects", href: "/dashboard/admin/subjects", featureKey: "subjects", section: "academics" },
    { icon: Building2, label: "Departments", href: "/dashboard/admin/departments", featureKey: "departments", section: "academics" },
    { icon: CheckSquare, label: "Attendance", href: "/dashboard/admin/attendance", featureKey: "attendance", section: "academics" },
    { icon: LibraryBig, label: "Library", href: "/dashboard/admin/library", featureKey: "library", section: "academics" },

    // === ADMINISTRATION ===
    { icon: CreditCard, label: "Finance & Billing", href: "/dashboard/admin/finance", featureKey: "finance", section: "administration" },
    { icon: WalletCards, label: "Payments", href: "/dashboard/admin/payments", featureKey: "payments", section: "administration" },
    { icon: BarChart3, label: "Reports & Analytics", href: "/dashboard/admin/reports", featureKey: "reports", section: "administration" },

    // === COMMUNICATION ===
    { icon: MessageSquare, label: "Communication", href: "/dashboard/admin/chat", featureKey: "communication", section: "communication" },
    { icon: Landmark, label: "Gallery & Media", href: "/dashboard/admin/gallery", featureKey: "gallery", section: "communication" },

    // === ADVANCED TOOLS ===
    { icon: BrainCircuit, label: "Artificial Intelligence", href: "/dashboard/admin/ai-tools", featureKey: "aiTools", section: "advanced" },
    { icon: Workflow, label: "Simulations", href: "/dashboard/admin/simulations", featureKey: "simulations", section: "advanced" },

    // === SETTINGS ===
    { icon: Settings, label: "Settings", href: "/dashboard/admin/settings", featureKey: "settings", section: "settings" },
];

// Filter menu items based on feature flags and group by section
const getFilteredMenuItemsBySection = () => {
    const filtered = adminMenuItems.filter(item => ADMIN_FEATURE_FLAGS[item.featureKey]);

    const sections = {
        core: filtered.filter(item => item.section === 'core'),
        academics: filtered.filter(item => item.section === 'academics'),
        administration: filtered.filter(item => item.section === 'administration'),
        communication: filtered.filter(item => item.section === 'communication'),
        advanced: filtered.filter(item => item.section === 'advanced'),
        settings: filtered.filter(item => item.section === 'settings'),
    };

    return sections;
};

// Section titles
const SECTION_TITLES = {
    core: "Core Management",
    academics: "Academics",
    administration: "Administration",
    communication: "Communication",
    advanced: "Advanced Tools",
    settings: "Settings"
};

interface AdminSidebarProps {
    isCollapsed: boolean;
    setIsCollapsed: (collapsed: boolean) => void;
}

export function AdminSidebar({ isCollapsed, setIsCollapsed }: AdminSidebarProps) {
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
    const menuSections = getFilteredMenuItemsBySection()

    return (
        <Sidebar
            collapsible="icon"
            className={cn(
                "transition-all duration-300 ease-in-out",
                isCollapsed ? "w-[80px]" : "w-[260px]"
            )}
        >
            {/* Header */}
            <SidebarHeader className="pt-8 flex items-center justify-between px-4 relative group overflow-visible">
                <SidebarMenu className="flex-1">
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
                                            {SECTION_TITLES[sectionKey as keyof typeof SECTION_TITLES]}
                                        </Typography>
                                    </div>
                                )}

                                {/* Section Items */}
                                {items.map(({ icon: Icon, label, href, featureKey }) => {
                                    const isActive = pathname === href;
                                    const isDisabled = !ADMIN_FEATURE_FLAGS[featureKey];

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
                                            <div className="flex flex-col items-start">
                                                <span className="font-medium text-[0.9rem] leading-none mb-1">Admin</span>
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
                                            <ChevronDown className="ml-auto h-4 w-4 opacity-70 cursor-pointer" />
                                        ) : (
                                            <ChevronUp className="ml-auto h-4 w-4 opacity-70 cursor-pointer" />
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
                                    Admin Account
                                </DropdownMenuItem>
                                <DropdownMenuItem className="cursor-pointer hover:bg-accent/60 rounded-md">
                                    System Settings
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