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
  LayoutDashboard,
  Building2,
  Users,
  GraduationCap,
  CalendarDays,
  Award,
  BookOpenCheck,
  CheckSquare,
  LibraryBig,
  CreditCard,
  WalletCards,
  BarChart3,
  MessageSquare,
  Landmark,
  BrainCircuit,
  Workflow,
  Settings,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

import { useLogoutMutation } from "@/app/(auth)/login/services/use-auth-mutations";
import { ADMIN_FEATURE_FLAGS, type AdminFeatureFlagKey } from "./adminFeatureFlags";

/* =========================
   Types
========================= */
interface AdminMenuItem {
  icon: LucideIcon;
  label: string;
  href: string;
  featureKey: AdminFeatureFlagKey;
  section?: keyof typeof SECTION_TITLES;
}

/* =========================
   Section titles
========================= */
const SECTION_TITLES = {
  core: "Core Management",
  academics: "Academics",
  administration: "Administration",
  communication: "Communication",
  advanced: "Advanced Tools",
  settings: "Settings",
} as const;

/* =========================
   Menu Items
   (same list you already have)
========================= */
export const adminMenuItems: AdminMenuItem[] = [
  // === CORE MANAGEMENT ===
  { icon: LayoutDashboard, label: "Overview", href: "/dashboard/admin", featureKey: "overview", section: "core" },
  { icon: Building2, label: "School Profile", href: "/dashboard/admin/school-profile", featureKey: "schoolProfile", section: "core" },
  { icon: Users, label: "Teachers", href: "/dashboard/admin/teachers", featureKey: "teachers", section: "core" },
  { icon: GraduationCap, label: "Students", href: "/dashboard/admin/students", featureKey: "students", section: "core" },
  { icon: CalendarDays, label: "Classes & Timetable", href: "/dashboard/admin/classes", featureKey: "classes", section: "core" },

  // === ACADEMICS ===
  { icon: Award, label: "Grades", href: "/dashboard/admin/grades", featureKey: "grades", section: "academics" },
  { icon: BookOpenCheck, label: "Exams & Quizzes", href: "/dashboard/admin/Exams&Quizzes", featureKey: "exams", section: "academics" },
  { icon: CheckSquare, label: "Attendance", href: "/dashboard/admin/attendance", featureKey: "attendance", section: "academics" },
  { icon: LibraryBig, label: "Library", href: "/dashboard/admin/library", featureKey: "library", section: "academics" },

  // === ADMINISTRATION ===
  { icon: CreditCard, label: "Finance & Billing", href: "/dashboard/admin/finance", featureKey: "finance", section: "administration" },
  { icon: WalletCards, label: "Payments", href: "/dashboard/admin/payments", featureKey: "payments", section: "administration" },
  { icon: BarChart3, label: "Reports & Analytics", href: "/dashboard/admin/reports", featureKey: "reports", section: "administration" },

  // === COMMUNICATION ===
  { icon: MessageSquare, label: "Communication", href: "/dashboard/admin/chat", featureKey: "communication", section: "communication" },
  { icon: Landmark, label: "Gallery & Media", href: "/dashboard/admin/gallery", featureKey: "gallery", section: "communication" },

  // === ADVANCED TOOLS ===
  { icon: BrainCircuit, label: "Artificial Intelligence", href: "/dashboard/admin/ai-tools", featureKey: "aiTools", section: "advanced" },
  { icon: Workflow, label: "Simulations", href: "/dashboard/admin/simulations", featureKey: "simulations", section: "advanced" },

  // === SETTINGS ===
  { icon: Settings, label: "Settings", href: "/dashboard/admin/settings", featureKey: "settings", section: "settings" },
];

/* =========================
   Helpers
========================= */
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

/**
 * Bottom tabs (optional)
 * Pick 3–5 most-used routes on mobile.
 */
const MOBILE_TABS: AdminFeatureFlagKey[] = ["overview", "students", "teachers", "classes", "settings"];

function buildBottomTabs(items: AdminMenuItem[]) {
  const available = items
    .filter((i) => MOBILE_TABS.includes(i.featureKey))
    .filter((i) => ADMIN_FEATURE_FLAGS[i.featureKey]);

  return MOBILE_TABS.map((k) => available.find((x) => x.featureKey === k)).filter(Boolean) as AdminMenuItem[];
}

/* =========================
   Component
========================= */
export function AdminMobileNav() {
  const pathname = usePathname();
  const { mutate: logout } = useLogoutMutation();
  const [open, setOpen] = React.useState(false);

  const sections = React.useMemo(() => getFilteredMenuItemsBySection(adminMenuItems), []);
  const bottomTabs = React.useMemo(() => buildBottomTabs(adminMenuItems), []);

  return (
    <>
      {/* Top bar (mobile only) */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur  md:hidden">
        <div className="h-14 px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* <div className="w-9 h-9 rounded-xl border border-border bg-background flex items-center justify-center">
              <School className="h-5 w-5 text-blue-500" />
            </div> */}
            {/* <div className="leading-tight">
              <div className="text-sm font-bold tracking-wide">SCHOOLHUB</div>
              <div className="text-[11px] text-muted-foreground">Admin Dashboard</div>
            </div> */}
          </div>

          {/* Drawer trigger */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="rounded-xl">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>

            {/* Drawer content (NO ScrollArea) */}
            <SheetContent side="left" className="p-0 w-[88vw] max-w-[380px] flex flex-col">
              {/* Header */}
              <div className="px-4 py-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl border border-border bg-background flex items-center justify-center">
                    <School className="h-5 w-5 text-blue-500" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-base font-bold">SCHOOLHUB</span>
                    <span className="text-xs text-muted-foreground">Admin navigation</span>
                  </div>
                </div>
              </div>

              {/* Scrollable menu content */}
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
        </div>
      </div>

      {/* Bottom tabs (mobile only) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background/90 backdrop-blur md:hidden">
        <div className="h-16 px-2 flex items-center justify-around">
          {bottomTabs.map((t) => {
            const Icon = t.icon;
            const isActive = pathname === t.href;

            return (
              <Link
                key={t.href}
                href={t.href}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="text-[10px] font-medium">{t.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Spacer so content doesn’t hide behind bottom tabs */}
      <div className="h-16 md:hidden" />
    </>
  );
}
