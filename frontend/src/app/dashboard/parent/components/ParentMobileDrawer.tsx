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
import { PARENT_FEATURE_FLAGS, type ParentFeatureFlagKey } from "./parentFeatureFlags";
import { parentMenuItems } from "./app-sidebar";
// ✅ import from where you export it

const PARENT_SECTION_TITLES = {
  core: "Children's Progress",
  monitoring: "Monitoring & Communication",
  financial: "Financial & Resources",
  advanced: "Advanced Tools",
  profile: "Account Settings",
} as const;

type ParentSectionKey = keyof typeof PARENT_SECTION_TITLES;

interface ParentMenuItem {
  icon: LucideIcon;
  label: string;
  href: string;
  featureKey: ParentFeatureFlagKey;
  section?: string;
}

function getFilteredParentMenuItemsBySection(items: ParentMenuItem[]) {
  const filtered = items.filter((i) => PARENT_FEATURE_FLAGS[i.featureKey]);

  return {
    core: filtered.filter((i) => i.section === "core"),
    monitoring: filtered.filter((i) => i.section === "monitoring"),
    financial: filtered.filter((i) => i.section === "financial"),
    advanced: filtered.filter((i) => i.section === "advanced"),
    profile: filtered.filter((i) => i.section === "profile"),
  } satisfies Record<ParentSectionKey, ParentMenuItem[]>;
}

export function ParentMobileDrawer() {
  const pathname = usePathname();
  const { mutate: logout } = useLogoutMutation();
  const [open, setOpen] = React.useState(false);

  const sections = React.useMemo(
    () => getFilteredParentMenuItemsBySection(parentMenuItems as any),
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
        <div className="px-6 py-6 border-b border-slate-100 dark:border-white/5">
          <Link href="/" onClick={() => setOpen(false)} className="flex items-center gap-3 group/logo">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-white/10 p-1.5 group-hover/logo:scale-105 transition-transform duration-500">
              <img src="/logo/favicon.svg" alt="Qefas Hub" className="h-full w-full object-contain" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight group-hover/logo:text-orange-500 transition-colors">QEFAS HUB</span>
              <span className="text-[10px] text-orange-500 font-bold uppercase tracking-widest mt-0.5">Parent Hub</span>
            </div>
          </Link>
        </div>

        {/* Menu */}
        <div className="flex-1 overflow-y-auto px-2 py-3">
          {Object.entries(sections).map(([key, items]) => {
            if (!items.length) return null;
            const sectionKey = key as ParentSectionKey;

            return (
              <div key={key} className="mb-5">
                <div className="px-3 pb-2 pt-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  {PARENT_SECTION_TITLES[sectionKey]}
                </div>

                <div className="space-y-1">
                  {items.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className={cn(
                          "flex items-center gap-3 rounded-xl px-3 py-3.5 transition-all duration-200",
                          isActive 
                            ? "bg-orange-600/10 text-orange-600 dark:text-orange-400 font-bold shadow-sm" 
                            : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 active:scale-[0.98]"
                        )}
                      >
                        <Icon className={cn("h-5 w-5 shrink-0", isActive ? "text-orange-600" : "text-slate-400")} />
                        <span className="text-[14px] flex-1 tracking-tight">{item.label}</span>
                        <ChevronRight className={cn("h-4 w-4 transition-transform", isActive ? "opacity-100 translate-x-0" : "opacity-30 -translate-x-1")} />
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-4 py-4 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/5">
          <div className="flex items-center gap-3 px-3 py-3 rounded-2xl bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-white/10">
            <div className="h-10 w-10 rounded-xl bg-orange-600/10 flex items-center justify-center">
              <User2 className="h-5 w-5 text-orange-600" />
            </div>
            <div className="flex-1">
              <div className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">Parent Account</div>
              <div className="text-[10px] text-orange-500 font-bold uppercase tracking-widest mt-0.5">Management Hub</div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-xl text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 transition-all"
              onClick={() => logout()}
              aria-label="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
