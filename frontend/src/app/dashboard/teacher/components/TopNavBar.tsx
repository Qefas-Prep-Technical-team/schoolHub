"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChevronDown, Search, ChevronLeft, ChevronRight, Bell, PlusCircle, User } from "lucide-react";
import Image from "next/image";
import { useAuthStore } from "@/app/(auth)/login/services/auth-store";
import { ThemeToggle } from "@/app/theme-toggle";
import { TeacherMobileDrawer } from "./TeacherMobileDrawer";
import NotificationCenter from "../../admin/components/NotificationCenter";
import { useState, useEffect } from "react";
import { linkService } from "@/lib/api/services/linkService";
import { teacherService } from "@/lib/api/services/teacherService";
import { useDashboardStore } from "@/lib/api/hooks/useDashboardStore";

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
  
  const { selectedSchoolId, schools, setSelectedSchoolId, setSchools } = useDashboardStore();
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    linkService.getProfile().then(setProfile).catch(() => {});
    
    // Fetch linked schools globally for the teacher dashboard
    teacherService.getLinkedSchools()
      .then(setSchools)
      .catch((err) => console.error("Failed to fetch linked schools in TopNavBar:", err));
  }, [setSchools]);

  const displayImage = profile?.data?.profileImage || user?.profileImage;
  const displayName = profile?.data?.name || user?.name || user?.email;

  const handleCreateNew = () => {
    console.log('Create new item');
    // Global create handler
  };

  return (
    <header className="sticky top-0 z-30 h-20 flex items-center bg-white/70 dark:bg-gray-900/70 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 transition-all duration-300">
      <div className="flex items-center justify-between w-full px-4 md:px-8 gap-4">
        {/* Left Section */}
        <div className="flex items-center gap-4 flex-1 min-w-0">
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
          <TeacherMobileDrawer />

          {/* School Context Switcher */}
          <div className="relative">
            <select
              value={selectedSchoolId}
              onChange={(e) => setSelectedSchoolId(e.target.value)}
              className="appearance-none bg-gray-100 dark:bg-gray-800 border-none rounded-xl px-4 py-2.5 pr-10 text-sm font-semibold text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer min-w-[180px] md:min-w-[220px]"
            >
              <option value="">Personal Dashboard</option>
              {schools.map((school: any) => (
                <option key={school.id} value={school.id}>
                  {school.name}
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
              <ChevronDown className="h-4 w-4" />
            </div>
          </div>

          {/* Search (hide on sm to save space) */}
          <div className="relative w-full max-w-sm hidden lg:block">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search classes, students..." 
              className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-sm border-none focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" 
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2 md:gap-4 shrink-0">
          {/* Create New Button */}
          <button
            onClick={handleCreateNew}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] transition-all whitespace-nowrap hidden sm:flex"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create New</span>
          </button>

          <div className="h-8 w-[1px] bg-gray-200 dark:bg-gray-800 mx-1 hidden md:block" />

          <NotificationCenter />
          <ThemeToggle />

          {/* Profile Pill */}
          <div 
            className="flex items-center gap-3 p-1.5 pl-1.5 bg-gray-100 dark:bg-gray-800 rounded-xl border border-transparent hover:border-gray-200 dark:hover:border-gray-700 cursor-pointer transition-all group lg:pr-4" 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
          >
            <div className="relative w-9 h-9 rounded-lg overflow-hidden bg-white dark:bg-gray-700 shadow-sm border border-gray-200 dark:border-gray-700 group-hover:scale-105 transition-transform">
              {displayImage ? (
                <Image src={displayImage} alt="Teacher Profile" fill className="object-cover" />
              ) : (
                <User className="h-5 w-5 text-gray-400" />
              )}
            </div>
            
            <div className="hidden lg:flex flex-col text-left">
              <p className="text-[11px] font-black uppercase tracking-widest leading-none text-gray-900 dark:text-white mb-1">{displayName}</p>
              <p className="text-[10px] font-bold text-gray-500 dark:text-gray-500 leading-none capitalize">{userType?.toLowerCase()}</p>
            </div>

            <ChevronDown
              className={`h-4 w-4 text-gray-400 transition-transform duration-200 hidden lg:block ${isProfileOpen ? 'rotate-180' : ''}`}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
