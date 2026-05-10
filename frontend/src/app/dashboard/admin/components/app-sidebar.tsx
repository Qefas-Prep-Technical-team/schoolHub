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
    Globe,
    BrainCircuit,
    Workflow,
    Settings,
    School,
    User2,
    ChevronUp,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    LucideIcon,
    LogOut,
    Copy
} from "lucide-react";
import { Box, Typography } from "@mui/material"
import { cn } from "@/lib/utils"
import { useLogoutMutation } from "@/app/(auth)/login/services/use-auth-mutations"
import { ADMIN_FEATURE_FLAGS, AdminFeatureFlagKey } from "./adminFeatureFlags"
import { useGlobalFeatures } from "@/lib/api/hooks/useGlobalFeatures"
import { linkService } from "@/lib/api/services/linkService"
import { toast } from "react-toastify"
import { useEffect, useMemo } from "react"


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
    { icon: CreditCard, label: "Finance", href: "/dashboard/admin/finance", featureKey: "finance", section: "administration" },
    { icon: WalletCards, label: "Payments", href: "/dashboard/admin/payments", featureKey: "payments", section: "administration" },
    { icon: CreditCard, label: "Transaction History", href: "/dashboard/admin/transactions", featureKey: "transactionHistory", section: "administration" },
    { icon: BarChart3, label: "Reports & Analytics", href: "/dashboard/admin/reports", featureKey: "reports", section: "administration" },

    // === COMMUNICATION ===
    { icon: MessageSquare, label: "Communication", href: "/dashboard/admin/chat", featureKey: "communication", section: "communication" },
    { icon: Landmark, label: "Gallery & Media", href: "/dashboard/admin/gallery", featureKey: "gallery", section: "communication" },

    // === ADVANCED TOOLS ===
    { icon: BrainCircuit, label: "Artificial Intelligence", href: "/dashboard/admin/ai-tools", featureKey: "aiTools", section: "advanced" },
    { icon: Workflow, label: "Simulations", href: "/dashboard/admin/simulations", featureKey: "simulations", section: "advanced" },

    // === SETTINGS ===
    { icon: Settings, label: "Settings", href: "/dashboard/admin/settings", featureKey: "settings", section: "settings" },
    { icon: MessageSquare, label: "Help & Support", href: "/dashboard/admin/support", featureKey: "support", section: "settings" },
];

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
    primaryColor?: string;
}

export function AdminSidebar({ isCollapsed, setIsCollapsed, primaryColor = '#2563eb' }: AdminSidebarProps) {
    const { mutate: logout } = useLogoutMutation()
    const [isUserOpen, setIsUserOpen] = useState(false)
    const [profile, setProfile] = useState<any>(null)
    const pathname = usePathname()

    // Fetch dynamic feature toggles from platform config
    const { data: dynamicFeatures, isLoading: isFeaturesLoading } = useGlobalFeatures('admin')

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
        const currentFeatures = dynamicFeatures || ADMIN_FEATURE_FLAGS;

        const filtered = adminMenuItems.filter(item => !!(currentFeatures as any)[item.featureKey]);

        return {
            core: filtered.filter(item => item.section === 'core'),
            academics: filtered.filter(item => item.section === 'academics'),
            administration: filtered.filter(item => item.section === 'administration'),
            communication: filtered.filter(item => item.section === 'communication'),
            advanced: filtered.filter(item => item.section === 'advanced'),
            settings: filtered.filter(item => item.section === 'settings'),
        };
    }, [dynamicFeatures, isFeaturesLoading]);

    return (
        <Sidebar
            collapsible="icon"
            className={cn(
                "transition-all duration-300 ease-in-out no-print border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-0",
                isCollapsed ? "w-[64px]" : "w-[200px]"
            )}
        >
            {/* Header */}
            <SidebarHeader className="pt-8 flex items-center justify-between px-4 relative">
                <div className="flex items-center gap-3">
                    <Link href="/" className="flex items-center gap-3">
                        <div 
                            className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/5 border border-primary/10 overflow-hidden p-1"
                            style={{ boxShadow: `0 4px 6px -1px ${primaryColor}10` }}
                        >
                            <img src="/logo/favicon.svg" alt="Qefas Hub" className="h-full w-full object-contain" />
                        </div>
                        {!isCollapsed && (
                            <div className="flex flex-col">
                                <span className="text-sm font-bold text-slate-900 dark:text-white tracking-tight uppercase">QEFAS HUB</span>
                                <span className="text-[10px] text-primary font-bold uppercase tracking-widest">Admin Portal</span>
                            </div>
                        )}
                    </Link>
                </div>
                
                {/* Floating Toggle Button */}
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        setIsCollapsed(!isCollapsed);
                    }}
                    className="absolute -right-3 top-20 z-50 h-6 w-6 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-400 hover:text-primary flex items-center justify-center transition-all group"
                    style={{ boxShadow: `0 2px 4px ${primaryColor}20` }}
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
                            {Array.from({ length: 14 }).map((_, i) => (
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
                                            {SECTION_TITLES[sectionKey as keyof typeof SECTION_TITLES]}
                                        </span>
                                    </div>
                                )}

                                {items.map(({ icon: Icon, label, href, featureKey }) => {
                                    const isActive = pathname === href;
                                    const features = (dynamicFeatures || ADMIN_FEATURE_FLAGS) as any;
                                    const isDisabled = !features[featureKey];

                                    return (
                                        <SidebarMenuItem key={label} className="my-1">
                                            <Link href={isDisabled ? "#" : href}>
                                                <SidebarMenuButton
                                                    className={cn(
                                                        "flex items-center gap-3 rounded-xl px-3 py-6 transition-all duration-200 group relative cursor-pointer",
                                                        isActive
                                                            ? "bg-primary/10 text-primary"
                                                            : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/[0.02] hover:text-slate-900 dark:hover:text-slate-100"
                                                    )}
                                                    style={isActive ? { boxShadow: `0 4px 6px -1px ${primaryColor}20` } : {}}
                                                    disabled={isDisabled}
                                                >
                                                    <Icon className={cn(
                                                        "h-5 w-5 transition-transform group-hover:scale-110",
                                                        isActive ? "text-primary" : "text-slate-400"
                                                    )} />
                                                    {!isCollapsed && (
                                                        <span className={cn(
                                                            "font-semibold tracking-tight flex-1",
                                                            isActive ? "text-primary" : ""
                                                        )}>{label}</span>
                                                    )}
                                                    {isDisabled && !isCollapsed && (
                                                        <span className="text-[9px] bg-slate-100 dark:bg-white/5 text-slate-500 font-bold px-1.5 py-0.5 rounded uppercase tracking-tighter">
                                                            Soon
                                                        </span>
                                                    )}
                                                    {isActive && (
                                                        <div 
                                                            className="absolute right-2 h-1.5 w-1.5 rounded-full bg-primary shadow-lg" 
                                                            style={{ boxShadow: `0 0 10px ${primaryColor}` }}
                                                        />
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
                                <SidebarMenuButton className="flex items-center gap-3 p-3 h-auto rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 hover:border-primary/30 transition-all group cursor-pointer">
                                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20 overflow-hidden shrink-0">
                                        {profile?.profileImage ? (
                                            <img src={profile.profileImage} alt={profile.name} className="h-full w-full object-cover" />
                                        ) : (
                                            <User2 className="h-6 w-6 text-primary/60" />
                                        )}
                                    </div>
                                    {!isCollapsed && (
                                        <div className="flex-1 flex flex-col items-start min-w-0 overflow-hidden">
                                            <span className="font-black text-xs text-slate-900 dark:text-white truncate leading-tight uppercase tracking-tight">{profile?.name || 'Admin'}</span>
                                            {profile?.linkingCode && (
                                                <span className="text-[9px] font-black text-primary uppercase tracking-[0.15em] mt-1">
                                                    ID: {profile.linkingCode}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                    {!isCollapsed && (
                                        <div className="text-slate-400 group-hover:text-primary transition-colors">
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
                                        className="cursor-pointer hover:bg-primary/10 rounded-xl font-bold text-xs p-4 flex flex-col items-start gap-1 group"
                                    >
                                        <span className="text-[10px] text-slate-400 uppercase tracking-widest font-black">Quick Link Code</span>
                                        <div className="flex items-center justify-between w-full">
                                            <span className="text-primary tracking-[0.2em] font-black text-base">{profile.linkingCode}</span>
                                            <Copy size={16} className="text-slate-400 group-hover:text-primary transition-colors" />
                                        </div>
                                    </DropdownMenuItem>
                                )}
                                <div className="h-[1px] bg-slate-200 dark:bg-slate-800 my-2 mx-2" />
                                <DropdownMenuItem asChild className="rounded-xl py-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5 font-medium text-slate-600 dark:text-slate-300">
                                    <Link href="/dashboard/admin/school-profile" className="w-full flex items-center">
                                        <Building2 className="mr-3 h-4 w-4" /> School Profile
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild className="rounded-xl py-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5 font-medium text-slate-600 dark:text-slate-300">
                                    <Link href="/dashboard/admin/billing" className="w-full flex items-center">
                                        <CreditCard className="mr-3 h-4 w-4" /> Subscription
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="rounded-xl py-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5 font-medium text-slate-600 dark:text-slate-300">
                                    <Settings className="mr-3 h-4 w-4" /> System Settings
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

