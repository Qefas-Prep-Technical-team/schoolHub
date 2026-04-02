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
  const schoolId = user?.schools?.[0]?.schoolId || user?.defaultTenantId || "";
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
        <div className="px-5 py-6 border-b border-white/10 bg-slate-50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-primary p-0.5 shadow-lg shadow-primary/20">
              <div className="w-full h-full rounded-[0.9rem] bg-white flex items-center justify-center overflow-hidden">
                {school?.logo ? (
                  <img src={school.logo} alt="School Logo" className="w-full h-full object-cover" />
                ) : (
                  <School className="h-6 w-6 text-primary" />
                )}
              </div>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-lg font-black tracking-tight uppercase truncate">
                {school?.name || "SCHOOLHUB"}
              </span>
              <div className="flex items-center gap-1.5">
                <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                  Admin Terminal
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Menu */}
        <div className="flex-1 overflow-y-auto px-2 py-3">
          {Object.entries(sections).map(([key, items]) => {
            if (!items.length) return null;
            const sectionKey = key as keyof typeof SECTION_TITLES;

            return (
              <div key={key} className="mb-5">
                <div className="px-3 pb-2 pt-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  {SECTION_TITLES[sectionKey]}
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
                          "flex items-center gap-3 rounded-xl px-3 py-3 transition-colors",
                          isActive ? "bg-accent text-accent-foreground" : "hover:bg-accent/60"
                        )}
                      >
                        <Icon className="h-5 w-5 shrink-0" />
                        <span className="text-sm font-medium flex-1">{item.label}</span>
                        <ChevronRight className="h-4 w-4 opacity-60" />
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-3 py-3 border-t border-border">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-border">
            <User2 className="h-5 w-5" />
            <div className="flex-1">
              <div className="text-sm font-medium">Admin</div>
              <div className="text-[11px] text-muted-foreground">Account & settings</div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="rounded-xl text-destructive hover:text-destructive"
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
