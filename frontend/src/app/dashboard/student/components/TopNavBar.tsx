"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Bell, ChevronDown, Search, ChevronLeft, ChevronRight, User, LayoutGrid, School } from "lucide-react";
import { useState, useEffect } from "react";
import { ThemeToggle } from "@/app/theme-toggle";
import { useAuthStore } from "@/app/(auth)/login/services/auth-store";
import { StudentMobileDrawer } from "./StudentMobileDrawer";
import NotificationCenter from "@/components/notifications/NotificationCenter";
import { useRouter } from "next/navigation";
import { linkService } from "@/lib/api/services/linkService";

export default function TopNavBar({
  onToggleSidebar,
  isCollapsed,
}: {
  onToggleSidebar?: () => void;
  isCollapsed?: boolean;
}) {
  const [profile, setProfile] = useState<any>(null);
  const { userType, user } = useAuthStore();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    linkService.getProfile().then(setProfile).catch(() => {});
  }, []);

  const displayImage = profile?.data?.profileImage || user?.profileImage;
  const displayName = profile?.data?.name || user?.name || user?.email;

  const handleProfileClick = () => {
    router.push("/dashboard/student/profile");
  };

  return (
    <header className="sticky top-0 z-40 flex h-20 items-center justify-between border-b border-slate-200 dark:border-white/5 bg-white/80 dark:bg-slate-950/80 px-4 backdrop-blur-xl md:px-8">
      <div className="flex items-center gap-6 flex-1">
        {/* Desktop collapse */}
        <div className="hidden md:block">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleSidebar}
            className="h-9 w-9 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 text-slate-500 dark:text-slate-400 transition-all border border-slate-200 dark:border-white/5"
          >
            {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </Button>
        </div>

        {/* Dashboard Badge */}
        <div className="hidden lg:flex items-center gap-2 bg-pink-500/10 border border-pink-500/20 px-3 py-1.5 rounded-full">
            <School size={14} className="text-pink-400" />
            <span className="text-[10px] font-bold text-pink-400 uppercase tracking-widest">Academic Hub</span>
        </div>

        {/* Mobile hamburger */}
        <StudentMobileDrawer />
      </div>

      {/* Central Search Section */}
      <div className="hidden md:flex flex-1 justify-center max-w-2xl px-8">
        <div className="relative w-full group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-pink-400 transition-colors" size={18} />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search subjects, assignments, resources..."
            className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 text-slate-900 dark:text-slate-200 placeholder:text-slate-500 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:bg-slate-200 dark:focus:bg-white/10 transition-all text-sm font-medium"
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
        <div 
          className="flex items-center gap-3 p-1.5 pl-1.5 pr-4 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10 transition-all cursor-pointer group rounded-xl"
          onClick={handleProfileClick}
        >
          <div className="relative h-9 w-9 rounded-lg bg-pink-600/10 dark:bg-pink-600/20 flex items-center justify-center border border-pink-500/20 dark:border-pink-500/30 overflow-hidden">
            {displayImage ? (
                <img src={displayImage} alt={displayName} className="h-full w-full object-cover group-hover:scale-110 transition-transform" />
            ) : (
                <User size={18} className="text-pink-600 dark:text-pink-400" />
            )}
            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white dark:border-slate-900" />
          </div>
          <div className="hidden lg:flex flex-col text-left">
            <p className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-none mb-1 truncate max-w-[120px]">{displayName}</p>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">{userType?.toLowerCase()} hub</p>
          </div>
        </div>
      </div>
    </header>
  );
}
