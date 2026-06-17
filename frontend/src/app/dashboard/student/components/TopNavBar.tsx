"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Bell, ChevronDown, Search, ChevronLeft, ChevronRight, User, LayoutGrid, School, QrCode } from "lucide-react";
import Link from "next/link";
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
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);

  const { data: studentProfile } = useQuery({
    queryKey: ["student-profile"],
    queryFn: () => studentService.getProfile(),
  });

  useEffect(() => {
    linkService.getProfile().then(setProfile).catch(() => {});
  }, []);

  const displayImage = profile?.data?.profileImage || user?.profileImage;
  const displayName = profile?.data?.name || user?.name || user?.email;
  const displaySchool = (studentProfile as any)?.school?.name || "Academic Hub";

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
            onClick={() => router.back()}
            className="h-9 w-9 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 text-slate-500 dark:text-slate-400 transition-all border border-slate-200 dark:border-white/5"
          >
            <ChevronLeft size={18} />
          </Button>
        </div>

        {/* Dashboard Badge */}
        <Link href="/" className="hidden lg:flex items-center gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 px-3 py-1.5 rounded-full shadow-sm hover:border-pink-500/30 transition-all group/badge">
            <img src={(studentProfile as any)?.school?.logo || "/logo/favicon.svg"} alt={displaySchool} className="h-4 w-4 object-contain group-hover/badge:scale-110 transition-transform rounded-full" />
            <span className="text-[10px] font-bold text-pink-400 uppercase tracking-widest">{displaySchool}</span>
        </Link>

        {/* Mobile hamburger */}
        <StudentMobileDrawer />
      </div>

      {/* Central Search Section */}
      <div className="hidden md:flex flex-1 justify-center max-w-2xl px-8 relative">
        <div className="relative w-full group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-pink-400 transition-colors" size={18} />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search dashboard modules..."
            className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 text-slate-900 dark:text-slate-200 placeholder:text-slate-500 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:bg-slate-200 dark:focus:bg-white/10 transition-all text-sm font-medium"
          />
        </div>
        
        {/* Search Results Dropdown */}
        {searchQuery && (
          <div className="absolute top-full left-8 right-8 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl overflow-hidden z-50 py-2 animate-in fade-in slide-in-from-top-4">
            <div className="px-3 pb-2 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">
              Quick Navigation
            </div>
            <div className="max-h-64 overflow-y-auto mt-2 custom-scrollbar">
              {[
                { name: 'Dashboard Overview', path: '/dashboard/student', keywords: 'home main start index' },
                { name: 'My Profile', path: '/dashboard/student/profile', keywords: 'account details info avatar identity' },
                { name: 'My Classes', path: '/dashboard/student/my-classes', keywords: 'classrooms homeroom subjects rooms courses' },
                { name: 'Assignments', path: '/dashboard/student/assignments', keywords: 'homework tasks grading to-do' },
                { name: 'Exams & Quizzes', path: '/dashboard/student/exams&quizzes', keywords: 'tests assessments CA papers' },
                { name: 'Attendance Record', path: '/dashboard/student/attendance', keywords: 'presence absent late roll call' },
                { name: 'Grades & Report Cards', path: '/dashboard/student/grades', keywords: 'marks scores report standalone' },
                { name: 'Documents & Files', path: '/dashboard/student/documents', keywords: 'resources library files media notes' },
                { name: 'Term Results', path: '/dashboard/student/result', keywords: 'final transcript certificate performance' },
                { name: 'Billing & Payments', path: '/dashboard/student/billing', keywords: 'invoices money fee plans subscription tuition' },
                { name: 'School Linking', path: '/dashboard/student/linking', keywords: 'join connect school hub institutions code invite' },
                { name: 'System Notifications', path: '/dashboard/student/notifications', keywords: 'alerts inbox unread ping messages' },
                { name: 'Settings & Security', path: '/dashboard/student/settings', keywords: 'preferences configure config password' },
                { name: 'Support & Help', path: '/dashboard/student/support', keywords: 'ticket assistance contact customer care faq' },
              ].filter(item => {
                const q = searchQuery.toLowerCase();
                return item.name.toLowerCase().includes(q) || item.keywords.includes(q);
              })
              .map((item, index) => (
                <Link
                  key={index}
                  href={item.path}
                  onClick={() => setSearchQuery("")}
                  className="flex items-center px-4 py-3 hover:bg-pink-50 dark:hover:bg-pink-500/10 text-sm font-bold text-slate-700 dark:text-slate-300 transition-colors border-l-2 border-transparent hover:border-pink-500"
                >
                  {item.name}
                </Link>
              ))}
              
              {[
                { name: 'Dashboard Overview', path: '/dashboard/student', keywords: 'home main start index' },
                { name: 'My Profile', path: '/dashboard/student/profile', keywords: 'account details info avatar identity' },
                { name: 'My Classes', path: '/dashboard/student/my-classes', keywords: 'classrooms homeroom subjects rooms courses' },
                { name: 'Assignments', path: '/dashboard/student/assignments', keywords: 'homework tasks grading to-do' },
                { name: 'Exams & Quizzes', path: '/dashboard/student/exams&quizzes', keywords: 'tests assessments CA papers' },
                { name: 'Attendance Record', path: '/dashboard/student/attendance', keywords: 'presence absent late roll call' },
                { name: 'Grades & Report Cards', path: '/dashboard/student/grades', keywords: 'marks scores report standalone' },
                { name: 'Documents & Files', path: '/dashboard/student/documents', keywords: 'resources library files media notes' },
                { name: 'Term Results', path: '/dashboard/student/result', keywords: 'final transcript certificate performance' },
                { name: 'Billing & Payments', path: '/dashboard/student/billing', keywords: 'invoices money fee plans subscription tuition' },
                { name: 'School Linking', path: '/dashboard/student/linking', keywords: 'join connect school hub institutions code invite' },
                { name: 'System Notifications', path: '/dashboard/student/notifications', keywords: 'alerts inbox unread ping messages' },
                { name: 'Settings & Security', path: '/dashboard/student/settings', keywords: 'preferences configure config password' },
                { name: 'Support & Help', path: '/dashboard/student/support', keywords: 'ticket assistance contact customer care faq' },
              ].filter(item => {
                const q = searchQuery.toLowerCase();
                return item.name.toLowerCase().includes(q) || item.keywords.includes(q);
              }).length === 0 && (
                <div className="px-4 py-8 text-center flex flex-col items-center justify-center gap-2">
                  <Search className="w-8 h-8 text-slate-300 dark:text-slate-600 mb-2" />
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-bold">No modules found</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500">Try searching for keywords like "profile", "results", or "assignments"</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-end gap-4 flex-1">
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
