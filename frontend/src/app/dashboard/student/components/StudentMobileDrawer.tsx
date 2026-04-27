/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, School, ChevronRight, User2, LogOut, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

import { useLogoutMutation } from "@/app/(auth)/login/services/use-auth-mutations";
import { STUDENT_FEATURE_FLAGS, type StudentFeatureFlagKey } from "./studentFeatureFlags";
import { studentMenuItems } from "./app-sidebar";
 // ✅ import from where you export it

const STUDENT_SECTION_TITLES = {
  core: "Learning",
  communication: "Communication",
  profile: "Account",
  advanced: "More Tools",
} as const;

type StudentSectionKey = keyof typeof STUDENT_SECTION_TITLES;

interface StudentMenuItem {
  icon: LucideIcon;
  label: string;
  href: string;
  featureKey: StudentFeatureFlagKey;
  section?: string;
}

function getFilteredStudentMenuItemsBySection(items: StudentMenuItem[]) {
  const filtered = items.filter((i) => STUDENT_FEATURE_FLAGS[i.featureKey]);

  return {
    core: filtered.filter((i) => i.section === "core"),
    communication: filtered.filter((i) => i.section === "communication"),
    profile: filtered.filter((i) => i.section === "profile"),
    advanced: filtered.filter((i) => i.section === "advanced"),
  } satisfies Record<StudentSectionKey, StudentMenuItem[]>;
}

export function StudentMobileDrawer() {
  const pathname = usePathname();
  const { mutate: logout } = useLogoutMutation();
  const [open, setOpen] = React.useState(false);

  const sections = React.useMemo(
    () => getFilteredStudentMenuItemsBySection(studentMenuItems as any),
    []
  );

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
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-600 shadow-lg shadow-pink-600/20">
              <School className="h-6 w-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-black text-slate-900 dark:text-white tracking-tight">QEFAS HUB</span>
              <span className="text-[10px] text-pink-500 font-black uppercase tracking-[0.2em]">Student Portal</span>
            </div>
          </div>
        </div>

        {/* Menu */}
        <div className="flex-1 overflow-y-auto px-4 py-6 bg-white dark:bg-slate-950">
          {Object.entries(sections).map(([key, items]) => {
            if (!items.length) return null;
            const sectionKey = key as StudentSectionKey;

            return (
              <div key={key} className="mb-8">
                <div className="px-4 pb-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
                  {STUDENT_SECTION_TITLES[sectionKey]}
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
                            ? "bg-pink-600/10 text-pink-600 dark:text-pink-400 border-pink-500/20 shadow-sm shadow-pink-600/5" 
                            : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5"
                        )}
                      >
                        <Icon className={cn("h-5 w-5 shrink-0 transition-transform", isActive && "scale-110")} />
                        <span className={cn("text-sm font-bold tracking-tight flex-1", isActive && "text-pink-600 dark:text-pink-400")}>{item.label}</span>
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
            <div className="h-10 w-10 rounded-xl bg-pink-600/10 dark:bg-pink-600/20 flex items-center justify-center border border-pink-500/20 overflow-hidden shrink-0">
               <User2 className="h-6 w-6 text-pink-500/60" />
            </div>
            <div className="flex-1 flex flex-col min-w-0">
              <span className="text-sm font-black text-slate-900 dark:text-white truncate uppercase tracking-tight">Student Hub</span>
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
