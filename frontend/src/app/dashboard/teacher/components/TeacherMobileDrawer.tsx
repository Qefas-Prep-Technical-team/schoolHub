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
import { FEATURE_FLAGS_TEACHERS, type FeatureTeacherFlagKey } from "@/lib/config/featureFlags";
import { menuItems } from "./app-sidebar";

// ✅ import from where you export it (your sidebar file)


interface MenuItem {
  icon: LucideIcon;
  label: string;
  href: string;
  featureKey: FeatureTeacherFlagKey;
}

function getFilteredMenuItems(items: MenuItem[]) {
  // filter by feature flags + remove duplicates by href/label
  const filtered = items.filter((i) => FEATURE_FLAGS_TEACHERS[i.featureKey]);

  const seen = new Set<string>();
  return filtered.filter((i) => {
    const key = `${i.href}::${i.label}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function TeacherMobileDrawer() {
  const pathname = usePathname();
  const { mutate: logout } = useLogoutMutation();
  const [open, setOpen] = React.useState(false);

  const items = React.useMemo(() => getFilteredMenuItems(menuItems as any), []);

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
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 shadow-lg shadow-emerald-600/20">
              <School className="h-6 w-6 text-white" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">QEFAS HUB</span>
              <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest mt-0.5">Teacher Hub</span>
            </div>
          </div>
        </div>

        {/* Menu */}
        <div className="flex-1 overflow-y-auto px-3 py-4 custom-scrollbar">
          <div className="px-3 pb-3 text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500">
            Teaching Tools
          </div>

          <div className="space-y-1.5">
            {items.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href + item.label}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-3.5 transition-all duration-200",
                    isActive 
                      ? "bg-emerald-600/10 text-emerald-600 dark:text-emerald-400 font-bold shadow-sm" 
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 active:scale-[0.98]"
                  )}
                >
                  <Icon className={cn("h-5 w-5 shrink-0", isActive ? "text-emerald-600" : "text-slate-400")} />
                  <span className="text-[14px] flex-1 tracking-tight">{item.label}</span>
                  <ChevronRight className={cn("h-4 w-4 transition-transform", isActive ? "opacity-100 translate-x-0" : "opacity-30 -translate-x-1")} />
                </Link>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-4 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/5">
          <div className="flex items-center gap-3 px-3 py-3 rounded-2xl bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-white/10">
            <div className="h-10 w-10 rounded-xl bg-emerald-600/10 flex items-center justify-center">
              <User2 className="h-5 w-5 text-emerald-600" />
            </div>
            <div className="flex-1">
              <div className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">Teacher Account</div>
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5 whitespace-nowrap">Settings & Tools</div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-xl text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 transition-colors"
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
