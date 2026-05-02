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
import { AdminMobileDrawer } from "./AdminMobileDrawer";

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
  { icon: CalendarDays, label: "Session Management", href: "/dashboard/admin/sessions", featureKey: "sessions", section: "core" },

  // === ACADEMICS ===
  { icon: Award, label: "Grades", href: "/dashboard/admin/grades", featureKey: "grades", section: "academics" },
  { icon: BookOpenCheck, label: "Exam Setup", href: "/dashboard/admin/exams", featureKey: "exams", section: "academics" },
  { icon: CheckSquare, label: "Attendance", href: "/dashboard/admin/attendance", featureKey: "attendance", section: "academics" },
  { icon: LibraryBig, label: "Library", href: "/dashboard/admin/library", featureKey: "library", section: "academics" },

  // === ADMINISTRATION ===
  { icon: CreditCard, label: "Subscription", href: "/dashboard/admin/billing", featureKey: "billing", section: "administration" },
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
      <div className="sticky top-0 z-40 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200 dark:border-white/5 md:hidden">
        <div className="h-16 px-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary shadow-lg shadow-primary/20">
              <School className="h-5 w-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">QEFAS HUB</span>
              <span className="text-[9px] text-primary font-bold uppercase tracking-widest">Admin Hub</span>
            </div>
          </div>

          <AdminMobileDrawer />
        </div>
      </div>

      {/* Bottom tabs (mobile only) */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl border-t border-slate-200 dark:border-white/5 px-4 pb-safe md:hidden">
        <div className="flex items-center justify-around h-16">
          {bottomTabs.map((t) => {
            const Icon = t.icon;
            const isActive = pathname === t.href;

            return (
              <Link
                key={t.href}
                href={t.href}
                className={cn(
                  "flex flex-col items-center justify-center gap-1.5 px-3 transition-all relative py-1",
                  isActive ? "text-primary" : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
                )}
              >
                {isActive && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full bg-primary shadow-lg shadow-primary/50" />
                )}
                <Icon className={cn("h-5 w-5 transition-transform", isActive ? "scale-110" : "scale-100")} />
                <span className={cn("text-[9px] font-black uppercase tracking-widest", isActive ? "opacity-100" : "opacity-70")}>{t.label}</span>
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

