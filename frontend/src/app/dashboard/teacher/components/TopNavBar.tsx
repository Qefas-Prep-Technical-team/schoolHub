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
import { useRef } from "react";
import { useRouter } from "next/navigation";
import { useGlobalFeatures } from "@/lib/api/hooks/useGlobalFeatures";
import { FEATURE_FLAGS_TEACHERS } from "@/lib/config/featureFlags";
import { menuGroups } from "./app-sidebar";

export default function TopNavBar() {
  const { toggleSidebar, state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { user } = useAuthStore();
  const { mutate: logout } = useLogoutMutation();
  const { data: teacherProfile } = useTeacherProfile();

  const { selectedSchoolId, selectedSchoolName, schools, setSelectedSchoolId, setSchools } =
    useDashboardStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const { data: dynamicFeatures } = useGlobalFeatures('teacher');
  const router = useRouter();
  
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

  // Handle Command/Ctrl + K shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handle clicking outside of search
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentFeatures = { ...FEATURE_FLAGS_TEACHERS, ...(dynamicFeatures || {}) };
  const allTeacherItems = menuGroups.flatMap(group => group.items.map(item => ({ ...item, section: group.label })));
  const searchResults = allTeacherItems.filter(item => {
    const isEnabled = !!(currentFeatures as any)[item.featureKey];
    if (!isEnabled) return false;
    return item.label.toLowerCase().includes(searchQuery.toLowerCase()) || 
           item.section.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const displayImage = teacherProfile?.profileImage || user?.profileImage;
  const displayName = teacherProfile?.name || user?.name || user?.email || "Teacher";
  const firstName = displayName?.split(" ")[0] ?? "Teacher";



  return (
    <header className="sticky top-0 z-30 h-16 flex items-center bg-white/90 dark:bg-neutral-950/90 backdrop-blur-xl border-b border-slate-200/80 dark:border-white/5 transition-all duration-500 px-4 md:px-6">
      <div className="flex items-center justify-between w-full max-w-[1800px] mx-auto gap-3">

        {/* ── LEFT: Sidebar toggle + Identity block ────────────────────── */}
        <div className="flex items-center gap-3 shrink-0">


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
        <div className="hidden md:flex flex-1 justify-center px-4 max-w-2xl mx-auto relative z-50">
          <div className="relative w-full group" ref={searchContainerRef}>
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-all duration-300 group-focus-within:text-emerald-500 group-focus-within:scale-105 z-10"
              size={16}
            />
            <input
              ref={searchInputRef}
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setIsSearchFocused(true); }}
              onFocus={() => setIsSearchFocused(true)}
              placeholder="Search dashboard modules..."
              className="w-full pl-10 pr-14 py-2.5 rounded-xl bg-slate-100/80 dark:bg-white/5 text-sm font-medium border border-transparent focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-emerald-500/15 focus:border-emerald-400/40 transition-all duration-300 outline-none relative z-10"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-0.5 px-1.5 py-1 rounded-md border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-[9px] font-black text-slate-400 select-none shadow-sm z-10 group-focus-within:border-emerald-500/30">
              <span className="opacity-50">⌘</span>K
            </div>
          </div>
          
          {/* Search Results Dropdown */}
          {isSearchFocused && searchQuery && (
            <div className="absolute top-[calc(100%+8px)] left-4 right-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl overflow-hidden z-50 py-2 animate-in fade-in slide-in-from-top-4">
              <div className="px-3 pb-2 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">
                Quick Navigation
              </div>
              <div className="max-h-64 overflow-y-auto mt-2 custom-scrollbar">
                {searchResults.length > 0 ? (
                  searchResults.map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={index}
                        onClick={() => {
                          router.push(item.href);
                          setSearchQuery("");
                          setIsSearchFocused(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 text-sm font-bold text-slate-700 dark:text-slate-300 transition-colors border-l-2 border-transparent hover:border-emerald-500 text-left group/item"
                      >
                        <div className="text-slate-400 group-hover/item:text-emerald-500 transition-colors">
                          <Icon size={18} />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-900 dark:text-white group-hover/item:text-emerald-500 transition-colors">{item.label}</div>
                          <div className="text-[10px] uppercase font-black text-slate-400 tracking-wider">{item.section}</div>
                        </div>
                      </button>
                    );
                  })
                ) : (
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
              <DropdownMenuItem className="flex items-center gap-2 rounded-lg py-2.5 px-3 cursor-pointer text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 focus:bg-emerald-500/10 focus:text-emerald-600 transition-all font-medium">
                  <Settings className="h-4 w-4" />
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
