"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Bell, Search, ChevronDown, ChevronLeft, ChevronRight, User, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/app/theme-toggle";
import { ParentMobileDrawer } from "./ParentMobileDrawer";
import { useState, useEffect } from "react";
import { linkService } from "@/lib/api/services/linkService";
import { useAuthStore } from "@/app/(auth)/login/services/auth-store";
import NotificationCenter from "@/components/notifications/NotificationCenter";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function TopNavBar() {
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === "collapsed";
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const { userType, user } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    linkService.getProfile().then(setProfile).catch(() => {});
  }, []);

  const displayImage = profile?.data?.profileImage || user?.profileImage;
  const displayName = profile?.data?.fullName || profile?.data?.name || user?.name || user?.email;

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between h-20 px-4 md:px-8 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-b border-slate-200 dark:border-white/5 transition-all duration-300">
      <div className="flex items-center gap-6 flex-1">
        {/* Sidebar Toggle for Desktop */}
        <div className="hidden md:block">
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleSidebar}
                  className="hidden md:flex h-10 w-10 items-center justify-center rounded-xl hover:bg-orange-500/10 dark:hover:bg-orange-500/20 text-slate-500 hover:text-orange-600 transition-all duration-300 outline-none"
                >
                  {isCollapsed ? (
                    <ChevronRight className="h-5 w-5" />
                  ) : (
                    <ChevronLeft className="h-5 w-5" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-orange-600 font-bold border-none text-white px-3 py-1.5 rounded-lg shadow-xl outline-none">
                <p className="text-[11px] uppercase tracking-widest">{isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Mobile hamburger */}
        <ParentMobileDrawer />

        {/* Child Selector */}
        <div className="relative hidden xl:block min-w-[200px] group">
          <select className="w-full appearance-none bg-slate-100 dark:bg-white/5 border border-transparent hover:border-orange-500/30 rounded-xl px-4 py-2.5 text-xs font-black text-slate-700 dark:text-slate-300 focus:ring-4 focus:ring-orange-500/10 transition-all cursor-pointer outline-none uppercase tracking-tight">
            <option>Emily Johnson</option>
            <option>Michael Johnson</option>
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover:text-orange-500 transition-colors">
            <ChevronDown className="h-4 w-4" />
          </div>
        </div>
      </div>

      {/* Central Search Section */}
      <div className="hidden md:flex flex-1 justify-center px-8">
        <div className="relative w-full max-w-2xl group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 transition-all duration-300 group-focus-within:text-orange-500 group-focus-within:scale-110" size={18} />
          <input 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search reports, events, or resources..." 
            className="w-full pl-12 pr-16 py-3 rounded-2xl bg-slate-100 dark:bg-white/5 text-sm font-medium border border-transparent focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500/30 transition-all duration-300 outline-none shadow-sm" 
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 px-2 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-[9px] font-black text-slate-400 select-none shadow-sm group-focus-within:border-orange-500/30">
            <span className="opacity-50">⌘</span>K
          </div>
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
        <div 
          className="flex items-center gap-2.5 p-1 pr-3 bg-white dark:bg-white/5 rounded-full border border-slate-200 dark:border-white/10 hover:border-orange-500/30 hover:bg-orange-500/5 cursor-pointer transition-all duration-300 group shadow-sm" 
          onClick={() => setIsProfileOpen(!isProfileOpen)}
        >
          <div className="relative w-8 h-8 rounded-full overflow-hidden bg-orange-600 p-0.5 transition-transform group-hover:scale-105 duration-500 ring-2 ring-orange-500/10 group-hover:ring-orange-500/30">
            <div className="w-full h-full rounded-full overflow-hidden bg-white dark:bg-slate-900">
              {displayImage ? (
                <img src={displayImage} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-orange-600 text-white">
                  <User className="h-4 w-4" />
                </div>
              )}
            </div>
          </div>
          
          <div className="hidden lg:flex flex-col min-w-0 text-left">
            <p className="text-[11px] font-black uppercase tracking-tight leading-none text-slate-900 dark:text-white truncate max-w-[100px]">{displayName}</p>
            <p className="text-[9px] font-bold text-orange-500 tracking-widest uppercase mt-0.5">Parent Portal</p>
          </div>

          <ChevronDown
            className={cn("h-3.5 w-3.5 text-slate-400 transition-transform duration-500", isProfileOpen ? "rotate-180 text-orange-500" : "group-hover:text-orange-500")}
          />
        </div>
      </div>
    </header>
  );
}
