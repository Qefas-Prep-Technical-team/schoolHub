"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  BookOpenCheck, 
  Users, 
  FileCheck2, 
  Award 
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  {
    name: "Home",
    href: "/dashboard/teacher",
    icon: LayoutDashboard,
  },
  {
    name: "Classes",
    href: "/dashboard/teacher/my-classes",
    icon: BookOpenCheck,
  },
  {
    name: "Students",
    href: "/dashboard/teacher/students",
    icon: Users,
  },
  {
    name: "Exams",
    href: "/dashboard/teacher/exams&quizzes",
    icon: FileCheck2,
  },
  {
    name: "Grades",
    href: "/dashboard/teacher/grades",
    icon: Award,
  },
];

export default function TeacherBottomNav() {
  const pathname = usePathname();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/90 dark:bg-slate-950/90 backdrop-blur-3xl border-t border-slate-200 dark:border-white/5 pb-safe rounded-t-2xl shadow-lg shadow-black/5">
      <nav className="flex items-center justify-around h-16 w-full max-w-md mx-auto px-2">
        {NAV_ITEMS.map((item) => {
          const isActive = item.href === "/dashboard/teacher"
            ? pathname === "/dashboard/teacher"
            : pathname.startsWith(item.href);

          return (
            <Link
              key={item.name}
              href={item.href}
              className="flex flex-col items-center justify-center w-full h-full relative group transition-all duration-300"
            >
              {isActive && (
                <div className="absolute top-0 w-8 h-1 bg-emerald-600 dark:bg-emerald-500 rounded-b-full shadow-[0_0_12px_rgba(5,150,105,0.6)]" />
              )}
              <div
                className={cn(
                  "p-2 rounded-xl transition-all duration-300",
                  isActive
                    ? "bg-emerald-600/10 text-emerald-600 dark:text-emerald-400 scale-110 shadow-sm"
                    : "text-slate-400 dark:text-slate-500 hover:text-emerald-600 hover:bg-slate-50 dark:hover:bg-white/5"
                )}
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
                    ? "text-emerald-600 dark:text-emerald-400 font-bold"
                    : "text-slate-400 dark:text-slate-500"
                )}
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
