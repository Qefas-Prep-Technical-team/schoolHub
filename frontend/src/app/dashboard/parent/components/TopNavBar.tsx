"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Bell, Search, ChevronDown, ChevronLeft, ChevronRight, User } from "lucide-react";
import Image from "next/image";
import { ThemeToggle } from "@/app/theme-toggle";
import { ParentMobileDrawer } from "./ParentMobileDrawer";
import { useState, useEffect } from "react";
import { linkService } from "@/lib/api/services/linkService";
import { useAuthStore } from "@/app/(auth)/login/services/auth-store";

export default function TopNavBar({
  onToggleSidebar,
  isCollapsed,
}: {
  onToggleSidebar?: () => void;
  isCollapsed?: boolean;
}) {
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
    <header className="sticky top-0 z-50 h-20 flex items-center bg-white/70 dark:bg-gray-900/70 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 transition-all duration-300">
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
          <ParentMobileDrawer />

          {/* Child Selector (Styled like school switcher) */}
          <div className="relative hidden sm:block">
            <select className="appearance-none bg-gray-100 dark:bg-gray-800 border-none rounded-xl px-4 py-2.5 pr-10 text-sm font-semibold text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer min-w-[200px]">
              <option>Emily Johnson</option>
              <option>Michael Johnson</option>
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
              <ChevronDown className="h-4 w-4" />
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2 md:gap-4 shrink-0">
          <div className="relative hidden lg:block w-64">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
             <input 
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               placeholder="Search..." 
               className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-sm border-none focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" 
             />
          </div>

          <Button variant="ghost" size="icon" className="rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800">
            <Bell className="h-5 w-5" />
          </Button>

          <ThemeToggle />

          <div className="h-8 w-[1px] bg-gray-200 dark:bg-gray-800 hidden md:block" />

          {/* Profile Pill */}
          <div className="flex items-center gap-3 p-1.5 pl-1.5 bg-gray-100 dark:bg-gray-800 rounded-xl border border-transparent hover:border-gray-200 dark:hover:border-gray-700 cursor-pointer transition-all group" onClick={() => setIsProfileOpen(!isProfileOpen)}>
            <div className="relative w-9 h-9 rounded-lg overflow-hidden bg-white dark:bg-gray-700 shadow-sm border border-gray-200 dark:border-gray-700 group-hover:scale-105 transition-transform">
              {displayImage ? (
                <Image src={displayImage} alt="Profile" fill className="object-cover" />
              ) : (
                <User className="h-5 w-5 text-gray-400" />
              )}
            </div>
            <div className="hidden md:block pr-2">
               <ChevronDown
                className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`}
               />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
