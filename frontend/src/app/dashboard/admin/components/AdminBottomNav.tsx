"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, GraduationCap, Award, CreditCard, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  {
    name: "Home",
    href: "/dashboard/admin",
    icon: LayoutDashboard,
  },
  {
    name: "Students",
    href: "/dashboard/admin/students",
    icon: GraduationCap,
  },
  {
    name: "Grades",
    href: "/dashboard/admin/grades",
    icon: Award,
  },
  {
    name: "Finance",
    href: "/dashboard/admin/finance",
    icon: CreditCard,
  },
  {
    name: "Settings",
    href: "/dashboard/admin/settings",
    icon: Settings,
  },
];

export default function AdminBottomNav({ primaryColor = '#2563eb' }: { primaryColor?: string }) {
  const pathname = usePathname();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/90 dark:bg-slate-950/90 backdrop-blur-3xl border-t border-slate-200 dark:border-white/5 pb-safe rounded-t-2xl shadow-lg shadow-black/5">
      <nav className="flex items-center justify-around h-16 w-full max-w-md mx-auto px-4">
        {NAV_ITEMS.map((item) => {
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
