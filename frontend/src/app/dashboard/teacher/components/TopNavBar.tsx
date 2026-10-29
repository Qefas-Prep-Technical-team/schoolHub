"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  User,
  ChevronDown,
  QrCode,
  LogOut,
  Settings,
  Bell,
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLogoutMutation } from "@/app/(auth)/login/services/use-auth-mutations";
import { UserQRModal } from "@/components/reusable/UserQRModal";
import { cn } from "@/lib/utils";
import { useTeacherProfile, useTeacherLinkedSchools } from "@/lib/api/hooks/useTeacher";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/app/(auth)/login/services/auth-store";
import { ThemeToggle } from "@/app/theme-toggle";
import { TeacherMobileDrawer } from "./TeacherMobileDrawer";
import NotificationCenter from "@/components/notifications/NotificationCenter";
import { useDashboardStore } from "@/lib/api/hooks/useDashboardStore";
import { useSidebar } from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { SchoolSwitcher } from "./SchoolSwitcher";
import { useRef } from "react";
import { useRouter } from "next/navigation";
import { useGlobalFeatures } from "@/lib/api/hooks/useGlobalFeatures";
import { FEATURE_FLAGS_TEACHERS } from "@/lib/config/featureFlags";
import { menuGroups } from "./app-sidebar";
import GlobalCommandSearch from "@/components/dashboard/GlobalCommandSearch";

export default function TopNavBar() {
  const { toggleSidebar, state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { user } = useAuthStore();
  const { mutate: logout } = useLogoutMutation();
  const { data: teacherProfile } = useTeacherProfile();
  const { data: linkedSchoolsData, isSuccess: isLinkedSchoolsSuccess } = useTeacherLinkedSchools();

  const { selectedSchoolId, selectedSchoolName, schools, setSelectedSchoolId, setSchools } =
    useDashboardStore();
  const { data: dynamicFeatures } = useGlobalFeatures('teacher');
  const router = useRouter();
  
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const hasAutoSelectedRef = useRef(false);

  // Auto-select connected school if linked, or default to personal dashboard
  useEffect(() => {
    if (!isLinkedSchoolsSuccess || !linkedSchoolsData) return;

    const schoolList = Array.isArray(linkedSchoolsData) ? linkedSchoolsData : [];
    setSchools(schoolList);

    // Auto-selection rule:
    // If a teacher is connected to a school already, make sure the drop down auto-selects that school;
    // but if not, default to personal dashboard.
    if (!hasAutoSelectedRef.current) {
      hasAutoSelectedRef.current = true;

      if (schoolList.length > 0) {
        // Teacher has connected school(s)
        const isCurrentSelectionConnected = schoolList.some((s) => s.id === selectedSchoolId);
        if (!isCurrentSelectionConnected) {
          const defaultSchool = schoolList[0];
          setSelectedSchoolId(defaultSchool.id, defaultSchool.name);
        }
      } else {
        // Teacher has no connected schools -> default to personal dashboard
        setSelectedSchoolId(user?.id || "personal", "Personal Dashboard");
      }
    } else {
      // If schools list is updated and empty, ensure fallback to personal dashboard
      if (schoolList.length === 0 && selectedSchoolId !== (user?.id || "personal")) {
        setSelectedSchoolId(user?.id || "personal", "Personal Dashboard");
      }
    }
  }, [isLinkedSchoolsSuccess, linkedSchoolsData, selectedSchoolId, setSchools, setSelectedSchoolId, user?.id]);

  const currentFeatures = { ...FEATURE_FLAGS_TEACHERS, ...(dynamicFeatures || {}), offlineGrades: true };

  const displayImage = teacherProfile?.profileImage || user?.profileImage;
  const displayName = teacherProfile?.name || user?.name || user?.email || "Teacher";
  const firstName = displayName?.split(" ")[0] ?? "Teacher";

  return (
    <header className="sticky top-0 z-30 h-16 flex items-center bg-white/90 dark:bg-neutral-950/90 backdrop-blur-xl border-b border-slate-200/80 dark:border-white/5 transition-all duration-500 px-4 md:px-6">
      <div className="flex items-center justify-between w-full max-w-[1800px] mx-auto gap-3">

        {/* ── LEFT: Sidebar toggle + Identity block ────────────────────── */}
        <div className="flex items-center gap-2 sm:gap-3 flex-1 justify-start min-w-0">
          {/* Mobile drawer */}
          <TeacherMobileDrawer />

          {/* School switcher */}
          <div className="flex items-center min-w-0">
            <SchoolSwitcher
              schools={schools}
              selectedId={selectedSchoolId}
              userId={user?.id || ""}
              userImage={displayImage}
              userName={displayName}
              onSelect={(id, name) => setSelectedSchoolId(id, name)}
            />
          </div>
        </div>

        {/* ── CENTRE: Optimized Command Search ────────────────────────── */}
        <GlobalCommandSearch
          role="teacher"
          featureFlags={currentFeatures}
          onOpenQR={() => setIsQRModalOpen(true)}
        />

        {/* ── RIGHT: Actions + Profile ──────────────────────────────────── */}
        <div className="flex items-center gap-2 flex-1 justify-end min-w-0">
          {/* QR button */}
          <button
            onClick={() => setIsQRModalOpen(true)}
            className="flex items-center justify-center w-9 h-9 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 hover:bg-emerald-500/10 hover:text-emerald-600 transition-all border border-slate-200/80 dark:border-white/5 shadow-sm"
          >
            <QrCode className="w-4 h-4 text-emerald-500" />
          </button>

          <NotificationCenter />
          <ThemeToggle />

          {/* ── Profile pill ── */}
          <DropdownMenu onOpenChange={setIsProfileOpen}>
            <DropdownMenuTrigger asChild>
              <div
                className="flex items-center gap-2.5 pl-1 pr-3 py-1 bg-white dark:bg-slate-900 rounded-full border border-slate-200 dark:border-white/10 hover:border-emerald-400/40 hover:shadow-md transition-all duration-300 group shadow-sm ml-1 cursor-pointer"
              >
                {/* Avatar */}
                <div className="relative h-7 w-7 rounded-full overflow-hidden shrink-0 ring-2 ring-emerald-500/15 group-hover:ring-emerald-500/40 transition-all duration-300">
                  {displayImage ? (
                    <img
                      src={displayImage}
                      alt={displayName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
                      <User className="h-3.5 w-3.5" />
                    </div>
                  )}
                  {/* Online dot */}
                  <span className="absolute bottom-0 right-0 w-2 h-2 bg-emerald-500 rounded-full border border-white dark:border-slate-900" />
                </div>

                {/* Name + role */}
                <div className="hidden lg:flex flex-col items-start min-w-0">
                  <span className="text-[11px] font-black text-slate-900 dark:text-white leading-tight truncate max-w-[110px]">
                    {firstName}
                  </span>
                </div>

                <ChevronDown
                  className={cn(
                    "h-3 w-3 text-slate-400 transition-transform duration-300 shrink-0",
                    isProfileOpen ? "rotate-180 text-emerald-500" : "group-hover:text-emerald-500"
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
                onClick={() => router.push('/dashboard/teacher/profile')}
                className="flex items-center gap-2 rounded-lg py-2.5 px-3 cursor-pointer text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 focus:bg-emerald-500/10 focus:text-emerald-600 transition-all font-semibold"
              >
                <User className="h-4 w-4" />
                <span>Teacher Profile</span>
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => router.push('/dashboard/teacher/notifications')}
                className="flex items-center gap-2 rounded-lg py-2.5 px-3 cursor-pointer text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 focus:bg-emerald-500/10 focus:text-emerald-600 transition-all font-medium"
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
      </div>

      <UserQRModal isOpen={isQRModalOpen} onClose={() => setIsQRModalOpen(false)} />
    </header>
  );
}
