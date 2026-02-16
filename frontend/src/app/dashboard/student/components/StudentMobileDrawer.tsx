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
        <div className="px-4 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl border border-border bg-background flex items-center justify-center">
              <School className="h-5 w-5 text-blue-500" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold">SCHOOLHUB</span>
              <span className="text-xs text-muted-foreground">Student navigation</span>
            </div>
          </div>
        </div>

        {/* Menu */}
        <div className="flex-1 overflow-y-auto px-2 py-3">
          {Object.entries(sections).map(([key, items]) => {
            if (!items.length) return null;
            const sectionKey = key as StudentSectionKey;

            return (
              <div key={key} className="mb-5">
                <div className="px-3 pb-2 pt-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  {STUDENT_SECTION_TITLES[sectionKey]}
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
              <div className="text-sm font-medium">Student</div>
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
