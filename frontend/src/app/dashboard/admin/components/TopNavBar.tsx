"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Bell, Settings, LayoutGrid, ChevronLeft, User, School, QrCode, LogOut, ChevronDown } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLogoutMutation } from "@/app/(auth)/login/services/use-auth-mutations";
import { cn } from "@/lib/utils";
import { UserQRModal } from "@/components/reusable/UserQRModal";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/app/theme-toggle";
import NotificationCenter from "@/components/notifications/NotificationCenter";
import { AdminMobileDrawer } from "./AdminMobileDrawer";
import { linkService } from "@/lib/api/services/linkService";
import { useAuthStore } from "@/app/(auth)/login/services/auth-store";
import { useDashboardStore } from "@/lib/api/hooks/useDashboardStore";
import { useEffect, useRef } from "react";
import { useGlobalFeatures } from "@/lib/api/hooks/useGlobalFeatures";
import { adminMenuItems } from "./app-sidebar";
import { ADMIN_FEATURE_FLAGS } from "./adminFeatureFlags";

import GlobalCommandSearch from "@/components/dashboard/GlobalCommandSearch";

/**
 * High-fidelity Admin TopNavBar
 */
const TopNavBar = ({ onToggleSidebar, isCollapsed, primaryColor = '#2563eb' }: { onToggleSidebar?: () => void, isCollapsed?: boolean, primaryColor?: string }) => {
    const { data: dynamicFeatures } = useGlobalFeatures('admin');
    
    const [profile, setProfile] = useState<any>(null);
    const [isQRModalOpen, setIsQRModalOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const { mutate: logout } = useLogoutMutation();
    const { userType, user } = useAuthStore();
    const { selectedSchoolName } = useDashboardStore();
    const router = useRouter();

    useEffect(() => {
        linkService.getProfile().then(setProfile).catch(() => {});
    }, []);

    const currentFeatures = { ...ADMIN_FEATURE_FLAGS, ...(dynamicFeatures || {}) };

    const displayImage = profile?.data?.profileImage || user?.profileImage;
    const displayName = profile?.data?.name || user?.name || user?.email;

    return (
        <header className="sticky top-0 z-40 flex h-16 md:h-20 items-center justify-between border-b border-slate-200 dark:border-white/5 bg-white/80 dark:bg-slate-950/80 px-4 backdrop-blur-xl md:px-8">
            <div className="flex items-center gap-2 md:gap-6 flex-1 justify-start min-w-0">
                {/* Mobile hamburger */}
                <div className="md:hidden flex items-center justify-center">
                    <AdminMobileDrawer primaryColor={primaryColor} />
                </div>
            </div>

            {/* Central Optimized Search Section (Desktop & Mobile Command Palette) */}
            <GlobalCommandSearch
                role="admin"
                primaryColor={primaryColor}
                featureFlags={currentFeatures}
                onOpenQR={() => setIsQRModalOpen(true)}
            />

            <div className="flex items-center justify-end gap-3 sm:gap-4 flex-1 min-w-0">
                {/* Quick Actions / QR Code */}
                <button 
                  onClick={() => setIsQRModalOpen(true)}
                  className="hidden sm:flex items-center justify-center w-11 h-11 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all border border-slate-200 dark:border-white/5"
                  style={{ boxShadow: `0 4px 6px -1px ${primaryColor}15` }}
                >
                    <QrCode className="w-5 h-5 text-primary" />
                </button>

                <UserQRModal isOpen={isQRModalOpen} onClose={() => setIsQRModalOpen(false)} />

                <ThemeToggle />

                <div className="h-8 w-[1px] bg-gray-200 dark:bg-gray-800 mx-1 hidden md:block" />

                <NotificationCenter />

                {/* Profile Pill */}
                <DropdownMenu onOpenChange={setIsProfileOpen}>
                  <DropdownMenuTrigger asChild>
                    <div 
                        className="flex items-center gap-3 p-1.5 pl-1.5 pr-4 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10 transition-all cursor-pointer group rounded-xl"
                    >
                        <div className="relative h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20 dark:border-primary/30 overflow-hidden shrink-0">
                            {displayImage ? (
                                <img src={displayImage} alt={displayName} className="h-full w-full object-cover group-hover:scale-110 transition-transform" />
                            ) : (
                                <User size={18} className="text-primary" />
                            )}
                            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white dark:border-slate-900" />
                        </div>
                        <div className="hidden lg:flex flex-col text-left">
                            <p className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-none mb-1 truncate max-w-[120px]">{displayName}</p>
                        </div>
                        <ChevronDown
                            className={cn(
                                "h-3.5 w-3.5 text-slate-400 transition-transform duration-300 shrink-0 ml-1",
                                isProfileOpen ? "rotate-180 text-primary" : "group-hover:text-primary"
                            )}
                        />
                    </div>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent
                    side="bottom"
                    align="end"
                    sideOffset={12}
                    className="w-[240px] rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl p-2 animate-in slide-in-from-top-2 duration-300 z-50"
                  >
                    <DropdownMenuItem 
                        onClick={() => router.push('/dashboard/admin/profile')}
                        className="flex items-center gap-2 rounded-lg py-2.5 px-3 cursor-pointer text-slate-700 dark:text-slate-300 hover:text-primary focus:bg-primary/10 focus:text-primary transition-all font-semibold"
                    >
                        <User className="h-4 w-4" />
                        <span>Admin Profile</span>
                    </DropdownMenuItem>

                    <DropdownMenuItem 
                        onClick={() => router.push('/dashboard/admin/notifications')}
                        className="flex items-center gap-2 rounded-lg py-2.5 px-3 cursor-pointer text-slate-600 dark:text-slate-400 hover:text-primary focus:bg-primary/10 focus:text-primary transition-all font-medium"
                    >
                        <Bell className="h-4 w-4" />
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
            </div>
        </header>
    );
};

export default TopNavBar;

