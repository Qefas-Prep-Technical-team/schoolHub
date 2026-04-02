"use client";

import { Input } from "@/components/ui/input";
import { Search, Building2, Globe, GraduationCap, Users as UsersIcon } from "lucide-react";
import { useState } from "react";
import { ThemeToggle } from "@/app/theme-toggle";
import { useAuthStore } from "@/app/(auth)/login/services/auth-store";
import { AdminMobileDrawer } from "./AdminMobileDrawer";
import NotificationCenter from "@/components/notifications/NotificationCenter";
import { useSchoolProfile } from "@/lib/api/hooks/useSchool";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function TopNavBar() {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const user = useAuthStore((state) => state.user);
  const schoolId = user?.schools?.[0]?.schoolId || user?.defaultTenantId || "";
  
  const { data: school, isLoading: schoolLoading } = useSchoolProfile(schoolId);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/20 dark:border-slate-800/50 bg-white/70 dark:bg-slate-950/70 backdrop-blur-xl no-print transition-all duration-300">
      <div className="flex items-center justify-between px-4 py-2.5 md:px-8 md:py-4 gap-4">
        
        {/* Left Section: Branding & Search */}
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <AdminMobileDrawer />
          
          <div className="flex flex-col hidden lg:flex mr-4">
            {schoolLoading ? (
              <Skeleton className="h-6 w-32 rounded-md" />
            ) : (
              <h1 className="text-lg font-black tracking-tight text-slate-800 dark:text-white uppercase truncate max-w-[200px]">
                {school?.name || "School Hub"}
              </h1>
            )}
            <div className="flex items-center gap-1.5">
               <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
               <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest leading-none">
                 Primary Node
               </span>
            </div>
          </div>

          <div className="relative w-full max-w-md hidden md:block group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={17} />
            <Input 
              placeholder="Search anything..." 
              className="pl-11 h-11 bg-slate-100/50 dark:bg-slate-900/50 border-transparent focus-visible:bg-white dark:focus-visible:bg-slate-900 focus-visible:ring-2 focus-visible:ring-primary/20 rounded-2xl text-sm transition-all shadow-sm"
            />
          </div>
        </div>

        {/* Right Section: Actions & User */}
        <div className="flex items-center gap-3 md:gap-5 shrink-0">
          <div className="hidden sm:flex items-center gap-1 bg-slate-100/50 dark:bg-slate-900/50 p-1 rounded-2xl border border-white/20 dark:border-slate-800/50">
            <ThemeToggle />
          </div>

          <NotificationCenter />

          <div 
            className="flex items-center gap-3 pl-2 pr-1 py-1 rounded-[1.5rem] bg-slate-100/50 dark:bg-slate-900/50 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 border border-transparent hover:border-white/20 transition-all cursor-pointer group"
            onClick={() => setIsProfileOpen(!isProfileOpen)}
          >
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-xs font-black text-slate-800 dark:text-white tracking-tight leading-tight">
                {user?.name || "Administrator"}
              </span>
              <span className="text-[9px] font-bold text-primary dark:text-primary/70 uppercase tracking-tighter leading-none">
                System Admin
              </span>
            </div>
            
            <div className="relative">
              <div className="h-9 w-9 md:h-10 md:w-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-primary flex items-center justify-center p-0.5 shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
                {school?.logo ? (
                  <img src={school.logo} alt="School Logo" className="w-full h-full rounded-[0.9rem] object-cover bg-white" />
                ) : (
                  <div className="w-full h-full rounded-[0.9rem] bg-white/10 flex items-center justify-center backdrop-blur-sm">
                    <Building2 className="text-white h-5 w-5" />
                  </div>
                )}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-green-500 border-2 border-white dark:border-slate-950 shadow-sm" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
