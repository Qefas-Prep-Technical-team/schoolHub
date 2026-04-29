"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  User, 
  ChevronDown,
  QrCode
} from "lucide-react";
import { UserQRModal } from "@/components/reusable/UserQRModal";
import { cn } from "@/lib/utils";
import { useTeacherProfile } from "@/lib/api/hooks/useTeacher";

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
  const { userType, user } = useAuthStore();
  const { data: teacherProfile } = useTeacherProfile();
  
  const { selectedSchoolId, schools, setSelectedSchoolId, setSchools } = useDashboardStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);

  useEffect(() => {
    teacherService.getLinkedSchools()
      .then(setSchools)
      .catch((err) => console.error("Failed to fetch linked schools in TopNavBar:", err));
  }, [setSchools]);

  useEffect(() => {
    if (!selectedSchoolId && user?.id) {
      setSelectedSchoolId(user.id, "Personal Dashboard");
    }
  }, [selectedSchoolId, user?.id, setSelectedSchoolId]);

  const displayImage = teacherProfile?.profileImage || user?.profileImage;
  const displayName = teacherProfile?.name || user?.name || user?.email;


  return (
    <header className="sticky top-0 z-30 h-20 flex items-center bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200 dark:border-white/5 transition-all duration-500 px-4 md:px-8">
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
                  className="hidden md:flex h-10 w-10 items-center justify-center rounded-xl hover:bg-emerald-500/10 dark:hover:bg-emerald-500/20 text-slate-500 hover:text-emerald-600 transition-all duration-300"
                >
                  {isCollapsed ? (
                    <ChevronRight className="h-5 w-5" />
                  ) : (
                    <ChevronLeft className="h-5 w-5" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-emerald-600 font-bold border-none text-white px-3 py-1.5 rounded-lg shadow-xl animate-in zoom-in-95">
                <p className="text-[11px] uppercase tracking-widest">{isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Dashboard Badge */}
          <Link href="/" className="hidden lg:flex items-center gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 px-3 py-1.5 rounded-full shadow-sm mr-2 hover:border-emerald-500/30 transition-all group/badge">
            <img src="/logo/favicon.svg" alt="Qefas Hub" className="h-4 w-4 object-contain group-hover/badge:scale-110 transition-transform" />
            <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Faculty Hub</span>
          </Link>

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
          <div className="relative w-full max-w-2xl group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 transition-all duration-300 group-focus-within:text-emerald-500 group-focus-within:scale-110" size={18} />
            <input 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search students, classes, or resources..." 
              className="w-full pl-12 pr-16 py-3 rounded-2xl bg-slate-100 dark:bg-white/5 text-sm font-medium border border-transparent focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500/30 transition-all duration-300 outline-none shadow-sm" 
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 px-2 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-[9px] font-black text-slate-400 select-none shadow-sm group-focus-within:border-emerald-500/30">
              <span className="opacity-50">⌘</span>K
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center justify-end gap-3 flex-1 shrink-0">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsQRModalOpen(true)}
              className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 hover:bg-emerald-500/10 hover:text-emerald-600 transition-all border border-slate-200 dark:border-white/5 shadow-sm"
            >
              <QrCode className="w-5 h-5 text-emerald-500" />
            </button>
            <NotificationCenter />
            <ThemeToggle />
          </div>

          <UserQRModal isOpen={isQRModalOpen} onClose={() => setIsQRModalOpen(false)} />

          <div 
            className="flex items-center gap-2.5 p-1 pr-3 bg-white dark:bg-white/5 rounded-full border border-slate-200 dark:border-white/10 hover:border-emerald-500/30 hover:bg-emerald-500/5 cursor-pointer transition-all duration-300 group shadow-sm" 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
          >
            <div className="relative w-8 h-8 rounded-full overflow-hidden bg-emerald-600 p-0.5 transition-transform group-hover:scale-105 duration-500 ring-2 ring-emerald-500/10 group-hover:ring-emerald-500/30">
              <div className="w-full h-full rounded-full overflow-hidden bg-white dark:bg-slate-900">
                {displayImage ? (
                  <img src={displayImage} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-emerald-600 text-white">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </div>
            </div>
            
            <div className="hidden lg:flex flex-col min-w-0">
              <p className="text-[11px] font-black uppercase tracking-tight leading-none text-slate-900 dark:text-white truncate max-w-[100px]">{displayName}</p>
              <p className="text-[9px] font-bold text-emerald-500 tracking-widest uppercase mt-0.5">Teacher</p>
            </div>

            <ChevronDown
              className={cn("h-3.5 w-3.5 text-slate-400 transition-transform duration-500", isProfileOpen ? "rotate-180 text-emerald-500" : "group-hover:text-emerald-500")}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
