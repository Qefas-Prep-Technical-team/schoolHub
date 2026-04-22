"use client";
import React, { useState } from "react";
import { Search, Bell, Settings, LayoutGrid, ChevronLeft, ChevronRight, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/app/theme-toggle";
import NotificationCenter from "./NotificationCenter";
import { AdminMobileDrawer } from "./AdminMobileDrawer";
import { linkService } from "@/lib/api/services/linkService";
import { useAuthStore } from "@/app/(auth)/login/services/auth-store";
import { useEffect } from "react";

/**
 * High-fidelity Admin TopNavBar
 */
const TopNavBar = ({ onToggleSidebar, isCollapsed }: { onToggleSidebar?: () => void, isCollapsed?: boolean }) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [notifications] = useState(5);
    const [profile, setProfile] = useState<any>(null);
    const { userType, user } = useAuthStore();

    useEffect(() => {
        linkService.getProfile().then(setProfile).catch(() => {});
    }, []);

    const displayImage = profile?.data?.profileImage || user?.profileImage;
    const displayName = profile?.data?.name || user?.name || user?.email;

    return (
        <header className="sticky top-0 z-30 flex items-center justify-between h-20 px-4 md:px-8 bg-white/70 dark:bg-gray-900/70 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 transition-all duration-300">
            <div className="flex items-center gap-6 flex-1">
                {/* Desktop collapse */}
                <div className="hidden md:block">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onToggleSidebar}
                    className="rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                  >
                    {isCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
                  </Button>
                </div>

                {/* Mobile hamburger */}
                <AdminMobileDrawer />
            </div>

            {/* Central Search Section */}
            <div className="hidden md:flex flex-1 justify-center px-8">
                <div className="relative w-full max-w-6xl group">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={22} />
                    <input
                        type="search"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search students, teachers, schools..."
                        className="w-full pl-14 pr-8 py-4 rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-500 border-none focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 text-base font-semibold transition-all shadow-inner"
                    />
                </div>
            </div>

            <div className="flex items-center justify-end gap-4 flex-1">
                {/* Quick Actions */}
                <button className="hidden sm:flex items-center justify-center w-11 h-11 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all">
                    <LayoutGrid className="w-5 h-5" />
                </button>

                <ThemeToggle />

                <div className="h-8 w-[1px] bg-gray-200 dark:bg-gray-800 mx-1 hidden md:block" />

                <NotificationCenter />

                {/* Profile Pill */}
                <div className="flex items-center gap-3 p-1.5 pl-1.5 pr-4 bg-gray-100 dark:bg-gray-800 rounded-xl border border-transparent hover:border-gray-200 dark:hover:border-gray-700 cursor-pointer transition-all group">
                    <div className="relative">
                        <div
                            className="bg-center bg-no-repeat bg-cover rounded-lg size-9 border border-white dark:border-gray-700 group-hover:scale-105 transition-transform bg-gray-200 dark:bg-gray-700"
                            style={{
                                backgroundImage: displayImage ? `url("${displayImage}")` : "none",
                            }}
                        >
                          {!displayImage && <User className="h-5 w-5 text-gray-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />}
                        </div>
                        <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white dark:border-gray-800" />
                    </div>
                    <div className="hidden md:block text-left text-nowrap">
                        <p className="text-xs font-bold text-gray-900 dark:text-white leading-tight">{displayName}</p>
                        <p className="text-[10px] text-gray-500 dark:text-gray-500 font-medium">System Administrator</p>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default TopNavBar;
