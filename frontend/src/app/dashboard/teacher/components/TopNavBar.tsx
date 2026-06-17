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
} from "lucide-react";
import { UserQRModal } from "@/components/reusable/UserQRModal";
import { cn } from "@/lib/utils";
import { useTeacherProfile } from "@/lib/api/hooks/useTeacher";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/app/(auth)/login/services/auth-store";
import { ThemeToggle } from "@/app/theme-toggle";
import { TeacherMobileDrawer } from "./TeacherMobileDrawer";
import NotificationCenter from "../../admin/components/NotificationCenter";
import { teacherService } from "@/lib/api/services/teacherService";
import { useDashboardStore } from "@/lib/api/hooks/useDashboardStore";
import { useSidebar } from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { SchoolSwitcher } from "./SchoolSwitcher";

export default function TopNavBar() {
  const { toggleSidebar, state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { user } = useAuthStore();
  const { data: teacherProfile } = useTeacherProfile();

  const { selectedSchoolId, selectedSchoolName, schools, setSelectedSchoolId, setSchools } =
    useDashboardStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);

  const [isFetchingSchools, setIsFetchingSchools] = useState(true);

  useEffect(() => {
    setIsFetchingSchools(true);
    teacherService
      .getLinkedSchools()
      .then((data) => {
        setSchools(data);
        setIsFetchingSchools(false);
      })
      .catch((err) => {
        console.error("Failed to fetch linked schools:", err);
        setIsFetchingSchools(false);
      });
  }, [setSchools]);

  // Auto-select first connected school, or personal if none
  useEffect(() => {
    // Wait until schools are fetched before attempting auto-selection
    if (!isFetchingSchools && !selectedSchoolId) {
      if (schools && schools.length > 0) {
        setSelectedSchoolId(schools[0].id as string, schools[0].name as string);
      } else if (user?.id) {
        setSelectedSchoolId(user.id, "Personal Dashboard");
      }
    }
  }, [selectedSchoolId, schools, user?.id, setSelectedSchoolId, isFetchingSchools]);

  const displayImage = teacherProfile?.profileImage || user?.profileImage;
  const displayName = teacherProfile?.name || user?.name || user?.email || "Teacher";
  const firstName = displayName?.split(" ")[0] ?? "Teacher";



  return (
    <header className="sticky top-0 z-30 h-16 flex items-center bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl border-b border-slate-200/80 dark:border-white/5 transition-all duration-500 px-4 md:px-6">
      <div className="flex items-center justify-between w-full max-w-[1800px] mx-auto gap-3">

        {/* ── LEFT: Sidebar toggle + Identity block ────────────────────── */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Sidebar toggle */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleSidebar}
                  className="hidden md:flex h-9 w-9 items-center justify-center rounded-xl hover:bg-emerald-500/10 dark:hover:bg-emerald-500/20 text-slate-500 hover:text-emerald-600 transition-all duration-300 shrink-0"
                >
                  {isCollapsed ? (
                    <ChevronRight className="h-4 w-4" />
                  ) : (
                    <ChevronLeft className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent
                side="right"
                className="bg-emerald-600 font-bold border-none text-white px-3 py-1.5 rounded-lg shadow-xl animate-in zoom-in-95"
              >
                <p className="text-[11px] uppercase tracking-widest">
                  {isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Mobile drawer */}
          <TeacherMobileDrawer />

          {/* School switcher */}
          <div className="hidden sm:block">
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

        {/* ── CENTRE: Search ────────────────────────────────────────────── */}
        <div className="hidden md:flex flex-1 justify-center px-4 max-w-2xl mx-auto relative">
          <div className="relative w-full group">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-all duration-300 group-focus-within:text-emerald-500 group-focus-within:scale-105"
              size={16}
            />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search dashboard modules..."
              className="w-full pl-10 pr-14 py-2.5 rounded-xl bg-slate-100/80 dark:bg-white/5 text-sm font-medium border border-transparent focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-emerald-500/15 focus:border-emerald-400/40 transition-all duration-300 outline-none"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-0.5 px-1.5 py-1 rounded-md border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-[9px] font-black text-slate-400 select-none shadow-sm">
              <span className="opacity-50">⌘</span>K
            </div>
          </div>
          
          {/* Search Results Dropdown */}
          {searchQuery && (
            <div className="absolute top-full left-4 right-4 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl overflow-hidden z-50 py-2 animate-in fade-in slide-in-from-top-4">
              <div className="px-3 pb-2 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">
                Quick Navigation
              </div>
              <div className="max-h-64 overflow-y-auto mt-2 custom-scrollbar">
                {[
                  { name: 'Dashboard Overview', path: '/dashboard/teacher', keywords: 'home main start index' },
                  { name: 'My Profile', path: '/dashboard/teacher/profile', keywords: 'account details info avatar identity' },
                  { name: 'My Classes', path: '/dashboard/teacher/my-classes', keywords: 'classrooms homeroom subjects rooms' },
                  { name: 'Students Directory', path: '/dashboard/teacher/students', keywords: 'pupils list kids users learners' },
                  { name: 'Parents & Guardians', path: '/dashboard/teacher/parents', keywords: 'family contact relations' },
                  { name: 'Exams & Quizzes', path: '/dashboard/teacher/exams&quizzes', keywords: 'tests assessments CA' },
                  { name: 'Create Exam/Quiz', path: '/dashboard/teacher/exams&quizzes/create', keywords: 'new test make generate' },
                  { name: 'Assignments', path: '/dashboard/teacher/assignments', keywords: 'homework tasks grading' },
                  { name: 'Create Assignment', path: '/dashboard/teacher/assignments/create-assignment', keywords: 'new homework task' },
                  { name: 'Grades Hub', path: '/dashboard/teacher/grades', keywords: 'marks scores standalone report cards' },
                  { name: 'Documents & Files', path: '/dashboard/teacher/documents', keywords: 'resources library files media pdf' },
                  { name: 'Billing & Payments', path: '/dashboard/teacher/billing', keywords: 'invoices money fee plans subscription' },
                  { name: 'School Linking', path: '/dashboard/teacher/linking', keywords: 'join connect school hub institutions code' },
                  { name: 'Notifications', path: '/dashboard/teacher/notifications', keywords: 'alerts inbox messages unread ping' },
                  { name: 'Settings', path: '/dashboard/teacher/settings', keywords: 'preferences configure config password' },
                  { name: 'Support & Help', path: '/dashboard/teacher/support', keywords: 'ticket assistance contact customer care faq' },
                ].filter(item => {
                  const q = searchQuery.toLowerCase();
                  return item.name.toLowerCase().includes(q) || item.keywords.includes(q);
                })
                .map((item, index) => (
                  <Link
                    key={index}
                    href={item.path}
                    onClick={() => setSearchQuery("")}
                    className="flex items-center px-4 py-3 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 text-sm font-bold text-slate-700 dark:text-slate-300 transition-colors border-l-2 border-transparent hover:border-emerald-500"
                  >
                    {item.name}
                  </Link>
                ))}
                
                {[
                  { name: 'Dashboard Overview', path: '/dashboard/teacher', keywords: 'home main start index' },
                  { name: 'My Profile', path: '/dashboard/teacher/profile', keywords: 'account details info avatar identity' },
                  { name: 'My Classes', path: '/dashboard/teacher/my-classes', keywords: 'classrooms homeroom subjects rooms' },
                  { name: 'Students Directory', path: '/dashboard/teacher/students', keywords: 'pupils list kids users learners' },
                  { name: 'Parents & Guardians', path: '/dashboard/teacher/parents', keywords: 'family contact relations' },
                  { name: 'Exams & Quizzes', path: '/dashboard/teacher/exams&quizzes', keywords: 'tests assessments CA' },
                  { name: 'Create Exam/Quiz', path: '/dashboard/teacher/exams&quizzes/create', keywords: 'new test make generate' },
                  { name: 'Assignments', path: '/dashboard/teacher/assignments', keywords: 'homework tasks grading' },
                  { name: 'Create Assignment', path: '/dashboard/teacher/assignments/create-assignment', keywords: 'new homework task' },
                  { name: 'Grades Hub', path: '/dashboard/teacher/grades', keywords: 'marks scores standalone report cards' },
                  { name: 'Documents & Files', path: '/dashboard/teacher/documents', keywords: 'resources library files media pdf' },
                  { name: 'Billing & Payments', path: '/dashboard/teacher/billing', keywords: 'invoices money fee plans subscription' },
                  { name: 'School Linking', path: '/dashboard/teacher/linking', keywords: 'join connect school hub institutions code' },
                  { name: 'Notifications', path: '/dashboard/teacher/notifications', keywords: 'alerts inbox messages unread ping' },
                  { name: 'Settings', path: '/dashboard/teacher/settings', keywords: 'preferences configure config password' },
                  { name: 'Support & Help', path: '/dashboard/teacher/support', keywords: 'ticket assistance contact customer care faq' },
                ].filter(item => {
                  const q = searchQuery.toLowerCase();
                  return item.name.toLowerCase().includes(q) || item.keywords.includes(q);
                }).length === 0 && (
                  <div className="px-4 py-8 text-center flex flex-col items-center justify-center gap-2">
                    <Search className="w-8 h-8 text-slate-300 dark:text-slate-600 mb-2" />
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-bold">No modules found</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">Try searching for keywords like "profile", "grades", or "files"</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT: Actions + Profile ──────────────────────────────────── */}
        <div className="flex items-center gap-2 shrink-0">
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
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
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
              <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest leading-tight">
                Teacher
              </span>
            </div>

            <ChevronDown
              className={cn(
                "h-3 w-3 text-slate-400 transition-transform duration-300 shrink-0",
                isProfileOpen ? "rotate-180 text-emerald-500" : "group-hover:text-emerald-500"
              )}
            />
          </button>
        </div>
      </div>

      <UserQRModal isOpen={isQRModalOpen} onClose={() => setIsQRModalOpen(false)} />
    </header>
  );
}
