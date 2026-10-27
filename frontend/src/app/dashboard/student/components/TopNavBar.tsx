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

import GlobalCommandSearch from "@/components/dashboard/GlobalCommandSearch";

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
  const { data: dynamicFeatures } = useGlobalFeatures('student');
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);

  const { data: studentProfile } = useQuery({
    queryKey: ["student-profile"],
    queryFn: () => studentService.getProfile(),
  });

  useEffect(() => {
    linkService.getProfile().then(setProfile).catch(() => {});
  }, []);

  const currentFeatures = { ...STUDENT_FEATURE_FLAGS, ...(dynamicFeatures || {}) };

  const displayImage = profile?.data?.profileImage || user?.profileImage;
  const displayName = profile?.data?.name || user?.name || user?.email;
  const displaySchool = (studentProfile as any)?.school?.name || "Academic Hub";

  const handleProfileClick = () => {
    router.push("/dashboard/student/profile");
  };

  return (
    <header className="sticky top-0 z-40 flex h-20 items-center justify-between border-b border-slate-200 dark:border-white/5 bg-white/80 dark:bg-slate-950/80 px-4 backdrop-blur-xl md:px-8">
      <div className="flex items-center gap-6 flex-1 justify-start min-w-0">
        {/* Mobile hamburger */}
        <StudentMobileDrawer />
      </div>

      {/* Central Optimized Command Search */}
      <GlobalCommandSearch
        role="student"
        featureFlags={currentFeatures}
        onOpenQR={() => setIsQRModalOpen(true)}
      />

      <div className="flex items-center justify-end gap-4 flex-1 min-w-0">
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

            <DropdownMenuItem 
                onClick={() => router.push("/dashboard/student/notifications")}
                className="flex items-center gap-2 rounded-lg py-2.5 px-3 cursor-pointer text-slate-600 dark:text-slate-400 hover:text-pink-600 dark:hover:text-pink-400 focus:bg-pink-500/10 focus:text-pink-600 transition-all font-medium"
            >
                <Bell className="h-4 w-4" />
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
