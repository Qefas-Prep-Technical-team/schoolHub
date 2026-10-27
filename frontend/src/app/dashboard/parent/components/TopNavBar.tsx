"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Bell, Search, ChevronDown, ChevronLeft, ChevronRight, User, LayoutGrid, QrCode, Settings, LogOut } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLogoutMutation } from "@/app/(auth)/login/services/use-auth-mutations";
import { UserQRModal } from "@/components/reusable/UserQRModal";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/app/theme-toggle";
import { ParentMobileDrawer } from "./ParentMobileDrawer";
import { useState, useEffect, useRef } from "react";
import { linkService } from "@/lib/api/services/linkService";
import { useAuthStore } from "@/app/(auth)/login/services/auth-store";
import NotificationCenter from "@/components/notifications/NotificationCenter";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

import { useGlobalFeatures } from "@/lib/api/hooks/useGlobalFeatures";
import { PARENT_FEATURE_FLAGS } from "./parentFeatureFlags";
import { useParentChildren } from "@/lib/api/hooks/useParentChildren";
import { useParentStore } from "@/lib/api/hooks/useParentStore";
import { parentMenuItems } from "./app-sidebar";

import GlobalCommandSearch from "@/components/dashboard/GlobalCommandSearch";

export default function TopNavBar() {
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === "collapsed";
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const { mutate: logout } = useLogoutMutation();
  const { userType, user } = useAuthStore();
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const { data: children = [], isLoading: isChildrenLoading } = useParentChildren();
  const { selectedChildId, setSelectedChildId } = useParentStore();
  const { data: dynamicFeatures } = useGlobalFeatures('parent');
  const router = useRouter();

  useEffect(() => {
    linkService.getProfile().then(setProfile).catch(() => {});
  }, []);

  // Initialize selectedChildId if not set
  useEffect(() => {
    if (!selectedChildId && children.length > 0) {
      setSelectedChildId(children[0].id);
    }
  }, [children, selectedChildId, setSelectedChildId]);

  const currentFeatures = { ...PARENT_FEATURE_FLAGS, ...(dynamicFeatures || {}) };

  const displayName = profile?.data?.fullName || profile?.data?.name || user?.name || user?.email;
  const [imgError, setImgError] = useState(false);
  const displayImage = (!imgError && (profile?.data?.profileImage || user?.profileImage) && (profile?.data?.profileImage || user?.profileImage) !== "null" && (profile?.data?.profileImage || user?.profileImage) !== "")
    ? (profile?.data?.profileImage || user?.profileImage)
    : `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(displayName || 'User')}&backgroundColor=ea580c&fontFamily=Arial&fontSize=40&fontWeight=900`;

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between h-20 px-4 md:px-8 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-b border-slate-200 dark:border-white/5 transition-all duration-300">
      <div className="flex items-center gap-6 flex-1 justify-start min-w-0">
        {/* Mobile hamburger */}
        <ParentMobileDrawer />

        {/* Child Selector */}
        <div className="relative hidden sm:block min-w-[150px] md:min-w-[180px] lg:min-w-[200px] group">
          <select 
            value={selectedChildId || ''}
            onChange={(e) => setSelectedChildId(e.target.value)}
            disabled={isChildrenLoading || children.length === 0}
            className="w-full appearance-none bg-slate-100 dark:bg-white/5 border border-transparent hover:border-orange-500/30 rounded-xl px-4 py-2.5 text-xs font-black text-slate-700 dark:text-slate-300 focus:ring-4 focus:ring-orange-500/10 transition-all cursor-pointer outline-none uppercase tracking-tight disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isChildrenLoading ? (
              <option value="">Loading children...</option>
            ) : children.length === 0 ? (
              <option value="">No children linked</option>
            ) : (
              children.map((child) => (
                <option key={child.id} value={child.id}>
                  {child.name}
                </option>
              ))
            )}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover:text-orange-500 transition-colors">
            <ChevronDown className="h-4 w-4" />
          </div>
        </div>
      </div>

      {/* Central Optimized Command Search */}
      <GlobalCommandSearch
        role="parent"
        featureFlags={currentFeatures}
        onOpenQR={() => setIsQRModalOpen(true)}
      />

      <div className="flex items-center justify-end gap-4 flex-1 min-w-0">
        {/* Quick Actions / QR Code */}
        <button 
          type="button"
          onClick={() => setIsQRModalOpen(true)}
          className="hidden sm:flex items-center justify-center w-11 h-11 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all border border-slate-200 dark:border-white/5 shadow-sm"
        >
          <QrCode className="w-5 h-5 text-orange-500" />
        </button>

        <UserQRModal isOpen={isQRModalOpen} onClose={() => setIsQRModalOpen(false)} />

        <ThemeToggle />

        <div className="h-8 w-[1px] bg-gray-200 dark:bg-gray-800 mx-1 hidden md:block" />

        <NotificationCenter />

        {/* Profile Pill */}
        <DropdownMenu onOpenChange={setIsProfileOpen}>
          <DropdownMenuTrigger asChild>
            <div 
              className="flex items-center gap-2.5 p-1 pr-3 bg-white dark:bg-white/5 rounded-full border border-slate-200 dark:border-white/10 hover:border-orange-500/30 hover:bg-orange-500/5 cursor-pointer transition-all duration-300 group shadow-sm" 
            >
              <div className="relative w-8 h-8 rounded-full overflow-hidden bg-orange-600 p-0.5 transition-transform group-hover:scale-105 duration-500 ring-2 ring-orange-500/10 group-hover:ring-orange-500/30">
                <div className="w-full h-full rounded-full overflow-hidden bg-white dark:bg-slate-900">
                  <img 
                    src={displayImage} 
                    alt="Profile" 
                    className="w-full h-full object-cover" 
                    onError={() => setImgError(true)}
                  />
                </div>
              </div>
              
              <div className="hidden lg:flex flex-col min-w-0 text-left">
                <p className="text-[11px] font-black uppercase tracking-tight leading-none text-slate-900 dark:text-white truncate max-w-[100px]">{displayName}</p>
              </div>

              <ChevronDown
                className={cn("h-3.5 w-3.5 text-slate-400 transition-transform duration-500", isProfileOpen ? "rotate-180 text-orange-500" : "group-hover:text-orange-500")}
              />
            </div>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            side="bottom"
            align="end"
            sideOffset={12}
            className="w-[240px] rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl p-2 animate-in slide-in-from-top-2 duration-300"
          >
            <DropdownMenuItem 
                onClick={() => router.push('/dashboard/parent/profile')}
                className="flex items-center gap-2 rounded-lg py-2.5 px-3 cursor-pointer text-slate-700 dark:text-slate-300 hover:text-orange-600 dark:hover:text-orange-400 focus:bg-orange-500/10 focus:text-orange-600 transition-all font-semibold"
            >
                <User className="h-4 w-4" />
                <span>Parent Profile</span>
            </DropdownMenuItem>

            <DropdownMenuItem 
                onClick={() => router.push('/dashboard/parent/notifications')}
                className="flex items-center gap-2 rounded-lg py-2.5 px-3 cursor-pointer text-slate-600 dark:text-slate-400 hover:text-orange-600 dark:hover:text-orange-400 focus:bg-orange-500/10 focus:text-orange-600 transition-all font-medium"
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
