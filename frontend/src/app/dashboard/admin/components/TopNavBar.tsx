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
import NotificationCenter from "./NotificationCenter";
import { AdminMobileDrawer } from "./AdminMobileDrawer";
import { linkService } from "@/lib/api/services/linkService";
import { useAuthStore } from "@/app/(auth)/login/services/auth-store";
import { useDashboardStore } from "@/lib/api/hooks/useDashboardStore";
import { useEffect, useRef } from "react";
import { useGlobalFeatures } from "@/lib/api/hooks/useGlobalFeatures";
import { adminMenuItems } from "./app-sidebar";
import { ADMIN_FEATURE_FLAGS } from "./adminFeatureFlags";

/**
 * High-fidelity Admin TopNavBar
 */
const TopNavBar = ({ onToggleSidebar, isCollapsed, primaryColor = '#2563eb' }: { onToggleSidebar?: () => void, isCollapsed?: boolean, primaryColor?: string }) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const searchContainerRef = useRef<HTMLDivElement>(null);
    const { data: dynamicFeatures } = useGlobalFeatures('admin');
    
    const [notifications] = useState(5);
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

    // Handle Command/Ctrl + K shortcut
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                searchInputRef.current?.focus();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Handle clicking outside of search
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
                setIsSearchFocused(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const currentFeatures = { ...ADMIN_FEATURE_FLAGS, ...(dynamicFeatures || {}) };
    const searchResults = adminMenuItems.filter(item => {
        const isEnabled = !!(currentFeatures as any)[item.featureKey];
        if (!isEnabled) return false;
        return item.label.toLowerCase().includes(searchQuery.toLowerCase()) || 
               (item.section && item.section.toLowerCase().includes(searchQuery.toLowerCase()));
    });

    const displayImage = profile?.data?.profileImage || user?.profileImage;
    const displayName = profile?.data?.name || user?.name || user?.email;
    const handleProfileClick = () => {};

    return (
        <header className="sticky top-0 z-40 flex h-16 md:h-20 items-center justify-between border-b border-slate-200 dark:border-white/5 bg-white/80 dark:bg-slate-950/80 px-4 backdrop-blur-xl md:px-8">
            <div className="flex items-center gap-2 md:gap-6 flex-1">
                {/* Mobile hamburger */}
                <div className="md:hidden flex items-center justify-center">
                    <AdminMobileDrawer primaryColor={primaryColor} />
                </div>


            </div>

            {/* Central Search Section */}
            <div className="hidden md:flex flex-1 justify-center max-w-2xl px-8 relative z-50">
                <div className="relative w-full group" ref={searchContainerRef}>
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors z-10" size={18} />
                    <input
                        ref={searchInputRef}
                        type="search"
                        value={searchQuery}
                        onChange={(e) => { setSearchQuery(e.target.value); setIsSearchFocused(true); }}
                        onFocus={() => setIsSearchFocused(true)}
                        placeholder="Search dashboard modules..."
                        className="w-full pl-11 pr-14 py-2.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 text-slate-900 dark:text-slate-200 placeholder:text-slate-500 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-slate-200 dark:focus:bg-white/10 transition-all text-sm font-medium relative z-10"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 px-2 py-1 rounded border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-[9px] font-black text-slate-400 select-none shadow-sm z-10 group-focus-within:border-primary/30">
                        <span className="opacity-50">⌘</span>K
                    </div>
                </div>
                
                {/* Search Results Dropdown */}
                {isSearchFocused && searchQuery && (
                    <div className="absolute top-[calc(100%+8px)] left-8 right-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl overflow-hidden z-50 py-2 animate-in fade-in slide-in-from-top-4">
                        <div className="px-3 pb-2 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">
                            Quick Navigation
                        </div>
                        <div className="max-h-64 overflow-y-auto mt-2 custom-scrollbar">
                            {searchResults.length > 0 ? (
                                searchResults.map((item, index) => {
                                    const Icon = item.icon;
                                    return (
                                        <button
                                            key={index}
                                            onClick={() => {
                                                router.push(item.href);
                                                setSearchQuery("");
                                                setIsSearchFocused(false);
                                            }}
                                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-bold text-slate-700 dark:text-slate-300 transition-colors border-l-2 border-transparent hover:border-primary text-left group/item"
                                        >
                                            <div className="text-slate-400 group-hover/item:text-primary transition-colors">
                                                <Icon size={18} />
                                            </div>
                                            <div>
                                                <div className="text-sm font-bold text-slate-900 dark:text-white group-hover/item:text-primary transition-colors">{item.label}</div>
                                                <div className="text-[10px] uppercase font-black text-slate-400 tracking-wider">{item.section}</div>
                                            </div>
                                        </button>
                                    );
                                })
                            ) : (
                                <div className="px-4 py-8 text-center flex flex-col items-center justify-center gap-2">
                                    <Search className="w-8 h-8 text-slate-300 dark:text-slate-600 mb-2" />
                                    <p className="text-sm text-slate-500 dark:text-slate-400 font-bold">No modules found</p>
                                    <p className="text-xs text-slate-400 dark:text-slate-500">Try searching for keywords like "profile", "settings", or "finance"</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <div className="flex items-center justify-end gap-4 flex-1">
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
                    <DropdownMenuItem className="flex items-center gap-2 rounded-lg py-2.5 px-3 cursor-pointer text-slate-600 dark:text-slate-400 hover:text-primary focus:bg-primary/10 focus:text-primary transition-all font-medium">
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
            </div>
        </header>
    );
};

export default TopNavBar;

