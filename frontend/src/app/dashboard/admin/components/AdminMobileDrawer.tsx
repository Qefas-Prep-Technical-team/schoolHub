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
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";

import { useLogoutMutation } from "@/app/(auth)/login/services/use-auth-mutations";
import { ADMIN_FEATURE_FLAGS, type AdminFeatureFlagKey, type AdminRole, ROLE_NAV_PERMISSIONS } from "./adminFeatureFlags";
import { adminMenuItems } from "./app-sidebar";
import { useSchoolProfile } from "@/lib/api/hooks/useSchool";
import { useAuthStore } from "@/app/(auth)/login/services/auth-store";
import { useGlobalFeatures } from "@/lib/api/hooks/useGlobalFeatures";

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



export function AdminMobileDrawer({ primaryColor = '#2563eb' }: { primaryColor?: string }) {
  const pathname = usePathname();
  const { mutate: logout } = useLogoutMutation();
  const [open, setOpen] = React.useState(false);
  
  const user = useAuthStore((state) => state.user);
  const schoolId = user?.schools?.[0]?.schoolId || user?.tenantId || "";
  const { data: school } = useSchoolProfile(schoolId);
  const { data: dynamicFeatures, isLoading: isFeaturesLoading } = useGlobalFeatures('admin');

  const sections = React.useMemo(() => {
        if (isFeaturesLoading) return {};
        const currentFeatures = { ...ADMIN_FEATURE_FLAGS, ...(dynamicFeatures || {}) };
        const adminRole = (user?.adminRole || user?.role) as AdminRole | undefined;

        const filtered = adminMenuItems.filter(item => {
            if (!(currentFeatures as Record<string, boolean>)[item.featureKey]) return false;
            if (adminRole === 'SCHOOL_OWNER') return true;
            
            const allowedRoles = ROLE_NAV_PERMISSIONS[item.featureKey as AdminFeatureFlagKey];
            if (!allowedRoles) return true;
            return !!adminRole && allowedRoles.includes(adminRole);
        });

        return {
            core: filtered.filter(item => item.section === 'core'),
            academics: filtered.filter(item => item.section === 'academics'),
            administration: filtered.filter(item => item.section === 'administration'),
            communication: filtered.filter(item => item.section === 'communication'),
            advanced: filtered.filter(item => item.section === 'advanced'),
            settings: filtered.filter(item => item.section === 'settings'),
        };
  }, [dynamicFeatures, isFeaturesLoading, user?.adminRole, user?.role]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="rounded-xl md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>

      <SheetContent side="left" className="p-0 w-[88vw] max-w-[380px] flex flex-col">
        <SheetTitle className="sr-only">Admin Navigation Menu</SheetTitle>
        {/* Header */}
        <div className="px-6 py-8 border-b border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-950/50">
          <Link href="/" onClick={() => setOpen(false)} className="flex items-center gap-4 group/logo">
            <div 
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 p-1.5 group-hover/logo:scale-105 transition-transform duration-500"
              style={{ boxShadow: `0 4px 6px -1px ${primaryColor}15` }}
            >
              <img src="/logo/favicon.svg" alt="Qefas Hub" className="h-full w-full object-contain" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-black text-slate-900 dark:text-white tracking-tight uppercase group-hover/logo:text-primary transition-colors">
                {school?.name || "QEFAS HUB"}
              </span>
              <span className="text-[10px] text-primary font-black uppercase tracking-[0.2em]">Admin Portal</span>
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
                  {items.map((item: any) => {
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
                            ? "bg-primary/10 text-primary border-primary/20" 
                            : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5"
                        )}
                        style={isActive ? { boxShadow: `0 4px 6px -1px ${primaryColor}20` } : {}}
                      >
                        <Icon className={cn("h-5 w-5 shrink-0 transition-transform", isActive && "scale-110")} />
                        <span className={cn("text-sm font-bold tracking-tight flex-1", isActive && "text-primary")}>{item.label}</span>
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
          <div 
            className="flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 transition-all"
            style={{ boxShadow: `0 4px 6px -1px ${primaryColor}10` }}
          >
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 overflow-hidden shrink-0">
               <User2 className="h-6 w-6 text-primary/60" />
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

