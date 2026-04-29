"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BookOpen, FileText, TrendingUp, User } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  {
    name: "Home",
    href: "/dashboard/student",
    icon: Home,
  },
  {
    name: "Classes",
    href: "/dashboard/student/my-classes",
    icon: BookOpen,
  },
  {
    name: "Exams",
    href: "/dashboard/student/exams&quizzes",
    icon: FileText,
  },
  {
    name: "Grades",
    href: "/dashboard/student/grades",
    icon: TrendingUp,
  },
  {
    name: "Profile",
    href: "/dashboard/student/profile",
    icon: User,
  },
];

export default function StudentBottomNav() {
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
                <div className="absolute top-0 w-8 h-1 bg-pink-500 rounded-b-full shadow-[0_0_12px_rgba(59,130,246,0.6)]" />
              )}
              <div
                className={cn(
                  "p-2 rounded-xl transition-all duration-300",
                  isActive
                    ? "bg-pink-500/10 text-pink-600 dark:text-pink-400 scale-110"
                    : "text-slate-400 dark:text-slate-500 hover:text-pink-500 hover:bg-slate-50 dark:hover:bg-white/5"
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
                    ? "text-pink-600 dark:text-pink-400"
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

