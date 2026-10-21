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
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet";

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
  // Hide Subscription/billing from mobile drawer, and filter by feature flags
  const filtered = items.filter((i) => i.featureKey !== "billing" && PARENT_FEATURE_FLAGS[i.featureKey]);

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
        <Button 
          variant="outline" 
          aria-label="Open mobile navigation menu"
          className="size-11 sm:size-12 rounded-2xl md:hidden flex items-center justify-center border-slate-200/90 dark:border-white/10 bg-white/80 dark:bg-slate-800/80 hover:bg-orange-50 dark:hover:bg-orange-950/30 hover:border-orange-500/40 text-slate-700 dark:text-slate-200 hover:text-orange-600 dark:hover:text-orange-400 transition-all shadow-xs active:scale-95 shrink-0"
        >
          <Menu className="h-6 w-6 sm:h-7 sm:w-7" strokeWidth={2.2} />
        </Button>
      </SheetTrigger>

      <SheetContent side="left" className="p-0 w-[88vw] max-w-[380px] flex flex-col">
        <SheetTitle className="sr-only">Parent Navigation Menu</SheetTitle>
        <SheetDescription className="sr-only">Mobile navigation links for Parent Hub</SheetDescription>

        {/* Header */}
        <div className="px-6 py-6 border-b border-slate-100 dark:border-white/5">
          <Link href="/?view=landing" onClick={() => setOpen(false)} className="flex items-center gap-3 group/logo">
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
          <button 
            onClick={() => {
              setOpen(false);
              logout();
            }}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-2xl bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-white/10 hover:border-rose-200 dark:hover:border-rose-900/50 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all text-left cursor-pointer group"
          >
            <div className="h-10 w-10 rounded-xl bg-rose-600 flex items-center justify-center group-hover:scale-105 transition-transform ring-2 ring-rose-500/10 group-hover:ring-rose-500/30">
              <LogOut className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <div className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">Parent Account</div>
              <div className="text-[10px] text-rose-500 font-bold uppercase tracking-widest mt-0.5">Sign Out</div>
            </div>
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
