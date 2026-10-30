"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { LayoutDashboard, ArrowLeft, Search, GraduationCap, School, BookOpen, Users } from "lucide-react";
import SchoolNotFoundView from "@/components/common/SchoolNotFoundView";
import { detectSubdomain } from "@/lib/utils/subdomain";
import { useAuthStore, UserType } from "@/app/(auth)/login/services/auth-store";

// Role-based design tokens matching Qefas Hub system
const ROLE_THEMES: Record<
  UserType,
  {
    name: string;
    icon: React.ElementType;
    dashboardUrl: string;
    badgeBg: string;
    badgeText: string;
    accentColor: string;
    iconBg: string;
    iconText: string;
    btnClass: string;
    glowClass: string;
    message: string;
  }
> = {
  STUDENT: {
    name: "Student",
    icon: GraduationCap,
    dashboardUrl: "/dashboard/student",
    badgeBg: "bg-pink-100 dark:bg-pink-950/60 border border-pink-200 dark:border-pink-800/60",
    badgeText: "text-pink-600 dark:text-pink-400",
    accentColor: "text-pink-500",
    iconBg: "bg-pink-50 dark:bg-pink-950/40 border border-pink-100 dark:border-pink-900/60 shadow-pink-500/10",
    iconText: "text-pink-600 dark:text-pink-400",
    btnClass: "bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white shadow-lg shadow-pink-500/25",
    glowClass: "from-pink-500/10 to-rose-500/10",
    message: "This student study resource or classroom route could not be found.",
  },
  TEACHER: {
    name: "Educator",
    icon: BookOpen,
    dashboardUrl: "/dashboard/teacher",
    badgeBg: "bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60",
    badgeText: "text-emerald-600 dark:text-emerald-400",
    accentColor: "text-emerald-500",
    iconBg: "bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/60 shadow-emerald-500/10",
    iconText: "text-emerald-600 dark:text-emerald-400",
    btnClass: "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-500/25",
    glowClass: "from-emerald-500/10 to-teal-500/10",
    message: "This instructional resource, classroom sheet, or grading assessment was moved or is unavailable.",
  },
  ADMIN: {
    name: "Administrator",
    icon: School,
    dashboardUrl: "/dashboard/admin",
    badgeBg: "bg-blue-100 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/60",
    badgeText: "text-blue-600 dark:text-blue-400",
    accentColor: "text-blue-500",
    iconBg: "bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/60 shadow-blue-500/10",
    iconText: "text-blue-600 dark:text-blue-400",
    btnClass: "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-500/25",
    glowClass: "from-blue-500/10 to-indigo-500/10",
    message: "The requested institutional record, management module, or administrative page could not be located.",
  },
  PARENT: {
    name: "Parent",
    icon: Users,
    dashboardUrl: "/dashboard/parent",
    badgeBg: "bg-orange-100 dark:bg-orange-950/60 border border-orange-200 dark:border-orange-800/60",
    badgeText: "text-orange-600 dark:text-orange-400",
    accentColor: "text-orange-500",
    iconBg: "bg-orange-50 dark:bg-orange-950/40 border border-orange-100 dark:border-orange-900/60 shadow-orange-500/10",
    iconText: "text-orange-600 dark:text-orange-400",
    btnClass: "bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white shadow-lg shadow-orange-500/25",
    glowClass: "from-orange-500/10 to-amber-500/10",
    message: "This child report, progress review, or parental access view was not found.",
  },
};

export default function NotFound() {
  const [subdomain, setSubdomain] = useState<string | null>(null);
  const [isSchoolRoute, setIsSchoolRoute] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const [pathname, setPathname] = useState("");

  const { user, isAuthenticated, userType: storeUserType } = useAuthStore();

  useEffect(() => {
    setHasMounted(true);
    if (typeof window === "undefined") return;

    setPathname(window.location.pathname);
    const detected = detectSubdomain(window.location.hostname);
    const p = window.location.pathname;
    const pathParts = p.split("/").filter(Boolean);
    const isSchoolPath = pathParts[0] === "school" || p.startsWith("/school/");

    if (detected) {
      setSubdomain(detected);
      setIsSchoolRoute(true);
    } else if (isSchoolPath) {
      setSubdomain(pathParts[1] || null);
      setIsSchoolRoute(true);
    }
  }, []);

  // Resolve active role theme from authStore or current pathname (e.g. /dashboard/student/...)
  const activeRole: UserType | null = useMemo(() => {
    if (user?.userType && ROLE_THEMES[user.userType]) return user.userType;
    if (storeUserType && ROLE_THEMES[storeUserType]) return storeUserType;

    // Fallback: deduce from dashboard route if available
    if (pathname.includes("/dashboard/student")) return "STUDENT";
    if (pathname.includes("/dashboard/teacher")) return "TEACHER";
    if (pathname.includes("/dashboard/admin")) return "ADMIN";
    if (pathname.includes("/dashboard/parent")) return "PARENT";

    return null;
  }, [user?.userType, storeUserType, pathname]);

  const theme = activeRole ? ROLE_THEMES[activeRole] : null;
  const RoleIcon = theme?.icon || Search;

  // When detected on a school subdomain or school route, render the specialized School Not Found view
  if (hasMounted && (isSchoolRoute || subdomain)) {
    return <SchoolNotFoundView subdomain={subdomain} type="school_not_found" />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-zinc-950 p-6 font-sans relative overflow-hidden">
      {/* Ambient background glow according to user role theme */}
      {theme && (
        <div
          className={`absolute -top-40 -left-40 w-96 h-96 rounded-full bg-gradient-to-br ${theme.glowClass} blur-3xl pointer-events-none opacity-80`}
        />
      )}

      <div className="max-w-md w-full text-center relative z-10">
        {/* Animated 404 Illustration */}
        <div className="relative mb-8 flex justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            <h1 className="text-9xl font-black text-slate-200 dark:text-zinc-800 select-none tracking-tight">
              404
            </h1>

            <motion.div
              animate={{
                y: [0, -15, 0],
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div
                className={`p-4 rounded-2xl shadow-xl ${
                  theme
                    ? theme.iconBg
                    : "bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800"
                }`}
              >
                <RoleIcon
                  size={48}
                  className={theme ? theme.iconText : "text-orange-500"}
                />
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Text Content */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-3"
        >
          {theme && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-1">
              <span className={`px-2.5 py-0.5 rounded-full ${theme.badgeBg} ${theme.badgeText}`}>
                {theme.name} Portal
              </span>
            </div>
          )}

          <h2 className="text-2xl font-black text-slate-900 dark:text-zinc-100 tracking-tight">
            Lost in the Hallways?
          </h2>
          <p className="text-sm text-slate-500 dark:text-zinc-400 max-w-sm mx-auto leading-relaxed">
            {theme
              ? theme.message
              : "We couldn't find the page you're looking for. It might have been moved, renamed, or no longer exists."}
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 flex flex-col sm:flex-row gap-3 justify-center"
        >
          <button
            type="button"
            onClick={() => window.history.back()}
            className="flex cursor-pointer items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors shadow-xs"
          >
            <ArrowLeft size={16} />
            <span>Go Back</span>
          </button>

          <Link
            href={theme?.dashboardUrl || (isAuthenticated ? "/dashboard" : "/")}
            className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all active:scale-95 ${
              theme
                ? theme.btnClass
                : "bg-orange-600 hover:bg-orange-700 text-white shadow-lg shadow-orange-500/25"
            }`}
          >
            <LayoutDashboard size={16} />
            <span>{theme ? `Return to ${theme.name} Dashboard` : "Return Home"}</span>
          </Link>
        </motion.div>

        {/* Footer Subtle Brand Tag */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ delay: 0.6 }}
          className="mt-12 text-xs text-slate-400 uppercase tracking-widest font-semibold"
        >
          Qefas Hub Academic Platform
        </motion.p>
      </div>
    </div>
  );
}
