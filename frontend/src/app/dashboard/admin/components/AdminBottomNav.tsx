"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, GraduationCap, Award, BookOpenCheck, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/app/(auth)/login/services/auth-store";
import { AdminFeatureFlagKey, AdminRole, canAdminRoleAccessFeature } from "./adminFeatureFlags";

const NAV_ITEMS: Array<{
  name: string;
  href: string;
  icon: typeof LayoutDashboard;
  featureKey: AdminFeatureFlagKey;
}> = [
    {
      name: "Home",
      href: "/dashboard/admin",
      icon: LayoutDashboard,
      featureKey: "overview",
    },
    {
      name: "Students",
      href: "/dashboard/admin/students",
      icon: GraduationCap,
      featureKey: "students",
    },
    {
      name: "Class",
      href: "/dashboard/admin/classes",
      icon: CalendarDays,
      featureKey: "classes",
    },
    {
      name: "Grades",
      href: "/dashboard/admin/grades",
      icon: Award,
      featureKey: "grades",
    },
    {
      name: "Exam",
      href: "/dashboard/admin/exams",
      icon: BookOpenCheck,
      featureKey: "exams",
    },
  ];

export default function AdminBottomNav({ primaryColor = '#2563eb' }: { primaryColor?: string }) {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const adminRole = (user?.adminRole || user?.role) as AdminRole | undefined;
  const visibleNavItems = NAV_ITEMS.filter((item) =>
    canAdminRoleAccessFeature(adminRole, item.featureKey)
  );

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/90 dark:bg-slate-950/90 backdrop-blur-3xl border-t border-slate-200 dark:border-white/5 pb-safe rounded-t-2xl shadow-lg shadow-black/5">
      <nav className="flex items-center justify-around h-16 w-full max-w-md mx-auto px-4">
        {visibleNavItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className="flex flex-col items-center justify-center w-full h-full relative group transition-all duration-300"
            >
              {isActive && (
                <div
                  className="absolute top-0 w-8 h-1 rounded-b-full transition-all duration-300"
                  style={{ backgroundColor: primaryColor, boxShadow: `0 0 12px ${primaryColor}80` }}
                />
              )}
              <div
                className={cn(
                  "p-2 rounded-xl transition-all duration-300",
                  isActive
                    ? "scale-110"
                    : "text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5"
                )}
                style={isActive ? { backgroundColor: `${primaryColor}1a`, color: primaryColor } : {}}
              >
                <item.icon
                  size={20}
                  strokeWidth={isActive ? 2.5 : 2}
                  className="transition-transform duration-300"
                />
              </div>
              <span
                className={cn(
                  "text-[9px] font-black uppercase tracking-[0.1em] mt-1 transition-colors duration-300",
                  isActive
                    ? ""
                    : "text-slate-400 dark:text-slate-500"
                )}
                style={isActive ? { color: primaryColor } : {}}
              >
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
