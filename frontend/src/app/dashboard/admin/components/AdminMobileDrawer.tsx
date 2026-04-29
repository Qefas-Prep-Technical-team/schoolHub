/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  School,
  ChevronRight,
  User2,
  LogOut,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

import { useLogoutMutation } from "@/app/(auth)/login/services/use-auth-mutations";
import { ADMIN_FEATURE_FLAGS, type AdminFeatureFlagKey } from "./adminFeatureFlags";
import { adminMenuItems } from "./AdminMobileNav";
import { useSchoolProfile } from "@/lib/api/hooks/useSchool";
import { useAuthStore } from "@/app/(auth)/login/services/auth-store";

const SECTION_TITLES = {
  core: "Core Management",
  academics: "Academics",
  administration: "Administration",
  communication: "Communication",
  advanced: "Advanced Tools",
  settings: "Settings",
} as const;

interface AdminMenuItem {
  icon: LucideIcon;
  label: string;
  href: string;
  featureKey: AdminFeatureFlagKey;
  section?: keyof typeof SECTION_TITLES;
}

function getFilteredMenuItemsBySection(items: AdminMenuItem[]) {
  const filtered = items.filter((i) => ADMIN_FEATURE_FLAGS[i.featureKey]);
  return {
    core: filtered.filter((i) => i.section === "core"),
    academics: filtered.filter((i) => i.section === "academics"),
    administration: filtered.filter((i) => i.section === "administration"),
    communication: filtered.filter((i) => i.section === "communication"),
    advanced: filtered.filter((i) => i.section === "advanced"),
    settings: filtered.filter((i) => i.section === "settings"),
  };
}

export function AdminMobileDrawer() {
  const pathname = usePathname();
  const { mutate: logout } = useLogoutMutation();
  const [open, setOpen] = React.useState(false);
  
  const user = useAuthStore((state) => state.user);
  const schoolId = user?.schools?.[0]?.schoolId || user?.tenantId || "";
  const { data: school } = useSchoolProfile(schoolId);

  const sections = React.useMemo(() => getFilteredMenuItemsBySection(adminMenuItems as any), []);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="rounded-xl md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>

      <SheetContent side="left" className="p-0 w-[88vw] max-w-[380px] flex flex-col">
        {/* Header */}
        <div className="px-6 py-8 border-b border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-950/50">
          <Link href="/" onClick={() => setOpen(false)} className="flex items-center gap-4 group/logo">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-white/10 p-1.5 group-hover/logo:scale-105 transition-transform duration-500">
              <img src="/logo/favicon.svg" alt="Qefas Hub" className="h-full w-full object-contain" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-black text-slate-900 dark:text-white tracking-tight uppercase group-hover/logo:text-indigo-500 transition-colors">
                {school?.name || "QEFAS HUB"}
              </span>
              <span className="text-[10px] text-indigo-500 font-black uppercase tracking-[0.2em]">Admin Portal</span>
            </div>
          </Link>
        </div>

        {/* Menu */}
        <div className="flex-1 overflow-y-auto px-4 py-6 bg-white dark:bg-slate-950">
          {Object.entries(sections).map(([key, items]) => {
            if (!items.length) return null;
            const sectionKey = key as keyof typeof SECTION_TITLES;

            return (
              <div key={key} className="mb-8">
                <div className="px-4 pb-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
                  {SECTION_TITLES[sectionKey]}
                </div>

                <div className="space-y-2">
                  {items.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className={cn(
                          "flex items-center gap-4 rounded-xl px-4 py-4 transition-all duration-200 border border-transparent",
                          isActive 
                            ? "bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20 shadow-sm shadow-indigo-600/5" 
                            : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5"
                        )}
                      >
                        <Icon className={cn("h-5 w-5 shrink-0 transition-transform", isActive && "scale-110")} />
                        <span className={cn("text-sm font-bold tracking-tight flex-1", isActive && "text-indigo-600 dark:text-indigo-400")}>{item.label}</span>
                        <ChevronRight className={cn("h-4 w-4 opacity-40 transition-transform", isActive && "translate-x-1 opacity-80")} />
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-6 border-t border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-950/50">
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 shadow-sm">
            <div className="h-10 w-10 rounded-xl bg-indigo-600/10 dark:bg-indigo-600/20 flex items-center justify-center border border-indigo-500/20 overflow-hidden shrink-0">
               <User2 className="h-6 w-6 text-indigo-500/60" />
            </div>
            <div className="flex-1 flex flex-col min-w-0">
              <span className="text-sm font-black text-slate-900 dark:text-white truncate uppercase tracking-tight">Admin Hub</span>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Account & settings</span>
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-all"
              onClick={() => logout()}
              aria-label="Sign out"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
