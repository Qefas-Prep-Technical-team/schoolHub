"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Bell, ChevronDown, Search, ChevronLeft, ChevronRight, User } from "lucide-react";
import { useState, useEffect } from "react";
import Image from "next/image";
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
    <header className="sticky top-0 z-40 h-20 flex items-center bg-white/70 dark:bg-gray-900/70 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 transition-all duration-300">
      <div className="flex items-center justify-between w-full px-4 md:px-8 gap-4">
        {/* Left */}
        <div className="flex items-center gap-4 flex-1 min-w-0">
          {/* Desktop collapse button */}
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
          <StudentMobileDrawer />

          {/* Search */}
          <div className="relative w-full max-w-sm hidden sm:block">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search subjects, assignments..." 
              className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-500 border-none focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm transition-all" 
            />
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2 md:gap-5 shrink-0">
          <NotificationCenter />
          <ThemeToggle />

          <div className="h-8 w-[1px] bg-gray-200 dark:bg-gray-800 hidden md:block" />

          {/* Profile Pill */}
          <div 
            className="flex items-center gap-3 p-1.5 pl-1.5 pr-4 bg-gray-100 dark:bg-gray-800 rounded-xl border border-transparent hover:border-gray-200 dark:hover:border-gray-700 cursor-pointer transition-all group" 
            onClick={handleProfileClick}
          >
            <div className="relative w-9 h-9 rounded-lg overflow-hidden bg-white dark:bg-gray-700 shadow-sm border border-gray-200 dark:border-gray-700 group-hover:scale-105 transition-transform">
              {displayImage ? (
                <Image
                  src={displayImage}
                  alt="Student Profile"
                  fill
                  className="object-cover"
                />
              ) : (
                <User className="h-5 w-5 text-gray-400" />
              )}
            </div>

            <div className="hidden md:flex flex-col text-left">
              <p className="text-[11px] font-black uppercase tracking-widest leading-none text-gray-900 dark:text-white mb-1">{displayName}</p>
              <p className="text-[10px] font-bold text-gray-500 dark:text-gray-500 leading-none capitalize">{userType?.toLowerCase()}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
