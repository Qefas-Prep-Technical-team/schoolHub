"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Bell, ChevronDown, Search, ChevronLeft, ChevronRight, User, LayoutGrid, School, QrCode, Settings, LogOut } from "lucide-react";
import Link from "next/link";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLogoutMutation } from "@/app/(auth)/login/services/use-auth-mutations";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { ThemeToggle } from "@/app/theme-toggle";
import { useAuthStore } from "@/app/(auth)/login/services/auth-store";
import { StudentMobileDrawer } from "./StudentMobileDrawer";
import NotificationCenter from "@/components/notifications/NotificationCenter";
import { useRouter } from "next/navigation";
import { linkService } from "@/lib/api/services/linkService";
import { UserQRModal } from "@/components/reusable/UserQRModal";
import { useQuery } from "@tanstack/react-query";
import { studentService } from "@/lib/api/services/studentService";
import { useRef } from "react";
import { useGlobalFeatures } from "@/lib/api/hooks/useGlobalFeatures";
import { studentMenuItems } from "./app-sidebar";
import { STUDENT_FEATURE_FLAGS } from "./studentFeatureFlags";

export default function TopNavBar({
  onToggleSidebar,
  isCollapsed,
}: {
  onToggleSidebar?: () => void;
  isCollapsed?: boolean;
}) {
  const [profile, setProfile] = useState<any>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { userType, user } = useAuthStore();
  const { mutate: logout } = useLogoutMutation();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const { data: dynamicFeatures } = useGlobalFeatures('student');
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);

  const { data: studentProfile } = useQuery({
    queryKey: ["student-profile"],
    queryFn: () => studentService.getProfile(),
  });

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

  const currentFeatures = { ...STUDENT_FEATURE_FLAGS, ...(dynamicFeatures || {}) };
  const searchResults = studentMenuItems.filter(item => {
      const key = item.featureKey === 'results' ? 'grades' : item.featureKey;
      const isEnabled = !!(currentFeatures as any)[key];
      if (!isEnabled) return false;
      return item.label.toLowerCase().includes(searchQuery.toLowerCase()) || 
             (item.section && item.section.toLowerCase().includes(searchQuery.toLowerCase()));
  });

  const displayImage = profile?.data?.profileImage || user?.profileImage;
  const displayName = profile?.data?.name || user?.name || user?.email;
  const displaySchool = (studentProfile as any)?.school?.name || "Academic Hub";

  const handleProfileClick = () => {
    router.push("/dashboard/student/profile");
  };

  return (
    <header className="sticky top-0 z-40 flex h-20 items-center justify-between border-b border-slate-200 dark:border-white/5 bg-white/80 dark:bg-slate-950/80 px-4 backdrop-blur-xl md:px-8">
      <div className="flex items-center gap-6 flex-1">


        {/* Mobile hamburger */}
        <StudentMobileDrawer />
      </div>

      {/* Central Search Section */}
      <div className="hidden md:flex flex-1 justify-center max-w-2xl px-8 relative z-50">
        <div className="relative w-full group" ref={searchContainerRef}>
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-pink-400 transition-colors z-10" size={18} />
          <input
            ref={searchInputRef}
            type="search"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setIsSearchFocused(true); }}
            onFocus={() => setIsSearchFocused(true)}
            placeholder="Search dashboard modules..."
            className="w-full pl-11 pr-14 py-2.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 text-slate-900 dark:text-slate-200 placeholder:text-slate-500 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:bg-slate-200 dark:focus:bg-white/10 transition-all text-sm font-medium relative z-10"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 px-2 py-1 rounded border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-[9px] font-black text-slate-400 select-none shadow-sm z-10 group-focus-within:border-pink-500/30">
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
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-pink-50 dark:hover:bg-slate-800 text-sm font-bold text-slate-700 dark:text-slate-300 transition-colors border-l-2 border-transparent hover:border-pink-500 text-left group/item"
                    >
                      <div className="text-slate-400 group-hover/item:text-pink-500 transition-colors">
                        <Icon size={18} />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-900 dark:text-white group-hover/item:text-pink-500 transition-colors">{item.label}</div>
                        <div className="text-[10px] uppercase font-black text-slate-400 tracking-wider">{item.section}</div>
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="px-4 py-8 text-center flex flex-col items-center justify-center gap-2">
                  <Search className="w-8 h-8 text-slate-300 dark:text-slate-600 mb-2" />
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-bold">No modules found</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500">Try searching for keywords like "profile", "results", or "assignments"</p>
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
          className="hidden sm:flex items-center justify-center w-11 h-11 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all border border-slate-200 dark:border-white/5 shadow-sm"
        >
          <QrCode className="w-5 h-5 text-pink-500" />
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
              <div className="relative h-9 w-9 rounded-lg bg-pink-600/10 dark:bg-pink-600/20 flex items-center justify-center border border-pink-500/20 dark:border-pink-500/30 overflow-hidden shrink-0">
                {displayImage ? (
                    <img src={displayImage} alt={displayName} className="h-full w-full object-cover group-hover:scale-110 transition-transform" />
                ) : (
                    <User size={18} className="text-pink-600 dark:text-pink-400" />
                )}
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white dark:border-slate-900" />
              </div>
              <div className="hidden lg:flex flex-col text-left">
                <p className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-none mb-1 truncate max-w-[120px]">{displayName}</p>
              </div>
              <ChevronDown
                  className={cn(
                      "h-3.5 w-3.5 text-slate-400 transition-transform duration-300 shrink-0 ml-1",
                      isProfileOpen ? "rotate-180 text-pink-500" : "group-hover:text-pink-500"
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
                onClick={handleProfileClick}
                className="flex items-center gap-2 rounded-lg py-2.5 px-3 cursor-pointer text-slate-600 dark:text-slate-400 hover:text-pink-600 dark:hover:text-pink-400 focus:bg-pink-500/10 focus:text-pink-600 transition-all font-medium"
            >
                <User className="h-4 w-4" />
                <span>My Profile</span>
            </DropdownMenuItem>

            <DropdownMenuItem className="flex items-center gap-2 rounded-lg py-2.5 px-3 cursor-pointer text-slate-600 dark:text-slate-400 hover:text-pink-600 dark:hover:text-pink-400 focus:bg-pink-500/10 focus:text-pink-600 transition-all font-medium">
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
}
