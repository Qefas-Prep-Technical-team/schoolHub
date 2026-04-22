"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  User, 
  ChevronDown 
} from "lucide-react";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/app/(auth)/login/services/auth-store";
import { ThemeToggle } from "@/app/theme-toggle";
import { TeacherMobileDrawer } from "./TeacherMobileDrawer";
import NotificationCenter from "../../admin/components/NotificationCenter";
import { linkService } from "@/lib/api/services/linkService";
import { teacherService } from "@/lib/api/services/teacherService";
import { useDashboardStore } from "@/lib/api/hooks/useDashboardStore";
import { useSidebar } from "@/components/ui/sidebar";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { SchoolSwitcher } from "./SchoolSwitcher";

export default function TopNavBar() {
  const { toggleSidebar, state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const { userType, user } = useAuthStore();
  
  const { selectedSchoolId, schools, setSelectedSchoolId, setSchools } = useDashboardStore();
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    linkService.getProfile().then(setProfile).catch(() => {});
    teacherService.getLinkedSchools()
      .then(setSchools)
      .catch((err) => console.error("Failed to fetch linked schools in TopNavBar:", err));
  }, [setSchools]);

  useEffect(() => {
    if (!selectedSchoolId && user?.id) {
      setSelectedSchoolId(user.id, "Personal Dashboard");
    }
  }, [selectedSchoolId, user?.id, setSelectedSchoolId]);

  const displayImage = profile?.data?.profileImage || user?.profileImage;
  const displayName = profile?.data?.name || user?.name || user?.email;


  return (
    <header className="sticky top-0 z-30 h-20 flex items-center bg-white/60 dark:bg-slate-950/60 backdrop-blur-xl border-b border-white/20 dark:border-slate-800/10 transition-all duration-500 px-4 md:px-6">
      <div className="flex items-center justify-between w-full max-w-[1600px] mx-auto gap-4">
        {/* Left Section */}
        <div className="flex items-center gap-2 md:gap-4 flex-1 min-w-0">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleSidebar}
                  className="hidden md:flex h-9 w-9 items-center justify-center rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-800/50 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all active:scale-95 shadow-sm"
                >
                  {isCollapsed ? (
                    <ChevronRight className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                  ) : (
                    <ChevronLeft className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p className="text-xs font-medium">{isCollapsed ? "Expand" : "Collapse"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TeacherMobileDrawer />

          <SchoolSwitcher 
            schools={schools}
            selectedId={selectedSchoolId}
            userId={user?.id || ""}
            onSelect={(id, name) => setSelectedSchoolId(id, name)}
          />
        </div>

        {/* Central Search Section */}
        <div className="hidden md:flex flex-1 justify-center px-8">
          <div className="relative w-full max-w-6xl group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-primary" size={22} />
            <input 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search anything: students, classes, or activity..." 
              className="w-full pl-16 pr-18 py-4 rounded-2xl bg-slate-100/50 dark:bg-slate-900/50 text-base font-semibold border border-transparent focus:bg-white dark:focus:bg-slate-950 focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all duration-300 outline-none shadow-inner" 
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-[10px] font-black text-slate-400 select-none shadow-sm">
              <span className="text-[9px] mt-0.5 opacity-60">⌘</span>K
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center justify-end gap-3 flex-1 shrink-0">
          <div className="flex items-center gap-1">
            <NotificationCenter />
            <ThemeToggle />
          </div>

          <div 
            className="flex items-center gap-2.5 p-1 pr-3 bg-slate-100/50 dark:bg-slate-900/50 rounded-full border border-slate-200/50 dark:border-slate-800/50 hover:bg-white dark:hover:bg-slate-900 hover:border-slate-200 dark:hover:border-slate-700 cursor-pointer transition-all group overflow-hidden shadow-sm" 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
          >
            <div className="relative w-7 h-7 rounded-full overflow-hidden bg-white dark:bg-slate-800 shadow-sm transition-transform group-hover:scale-110 duration-500">
              {displayImage ? (
                <Image src={displayImage} alt="Profile" fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-slate-100 dark:bg-slate-800">
                  <User className="h-3.5 w-3.5 text-slate-400" />
                </div>
              )}
            </div>
            
            <div className="hidden lg:flex flex-col">
              <p className="text-[10px] font-black uppercase tracking-tighter leading-none text-slate-900 dark:text-slate-100 max-w-[80px] truncate">{displayName}</p>
            </div>

            <ChevronDown
              className={`h-3 w-3 text-slate-400 transition-transform duration-500 ${isProfileOpen ? 'rotate-180' : ''}`}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
