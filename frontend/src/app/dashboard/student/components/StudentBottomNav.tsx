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
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-3xl border-t border-slate-200/50 dark:border-slate-800/50 pb-safe">
      <nav className="flex items-center justify-around h-16 w-full max-w-md mx-auto px-2">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className="flex flex-col items-center justify-center w-full h-full space-y-1 relative group"
            >
              {isActive && (
                <div className="absolute top-0 w-8 h-1 bg-primary rounded-b-full shadow-[0_0_8px_rgba(var(--primary),0.5)]" />
              )}
              <div
                className={cn(
                  "p-1.5 rounded-full transition-all duration-300",
                  isActive
                    ? "bg-primary/10 text-primary scale-110"
                    : "text-slate-500 dark:text-slate-400 group-hover:text-primary group-hover:bg-slate-100 dark:group-hover:bg-slate-800"
                )}
              >
                <item.icon
                  size={22}
                  strokeWidth={isActive ? 2.5 : 2}
                  className="transition-transform duration-300"
                />
              </div>
              <span
                className={cn(
                  "text-[10px] font-bold tracking-wide transition-colors duration-300",
                  isActive
                    ? "text-primary"
                    : "text-slate-500 dark:text-slate-400"
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
