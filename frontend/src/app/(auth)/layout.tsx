/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useMemo } from "react";
import { useAuthStore } from "./login/services/auth-store";
import GenericLoader from "@/components/reuseables/GenericLoader";
import { useProtectedRoute } from "@/hooks/useProtectedRoute";
import { ShieldCheck, GraduationCap, Users, UserCog, Lock } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const { userType, isInitialized, isAuthenticated, hasCompletedOnboarding } =
    useAuthStore() as any; // remove `as any` once you add the property properly

  const safeType = (userType ?? "").toLowerCase();

  const redirectTo = useMemo(() => {
    // If user isn't logged in, no redirect
    if (!isAuthenticated) return "";

    // If logged in but onboarding not done, push to onboarding
    if (!hasCompletedOnboarding) {
      return `/onboarding?type=${userType ?? ""}`;
    }

    // Otherwise go to role dashboard
    return `/dashboard/${safeType}`;
  }, [isAuthenticated, hasCompletedOnboarding, userType, safeType]);

  // Redirect to dashboard/onboarding if they are already logged in
  const { isChecking } = useProtectedRoute({
    requireAuth: false,
    redirectTo,
  });

  const getLoaderConfig = () => {
    switch (userType) {
      case "STUDENT":
        return { msg: "Entering Student Portal", color: "blue" as const, icon: GraduationCap };
      case "TEACHER":
        return { msg: "Accessing Faculty Suite", color: "emerald" as const, icon: Users };
      case "ADMIN":
        return { msg: "Secure Admin Access", color: "rose" as const, icon: UserCog };
      case "PARENT":
        return { msg: "Opening Parent Dashboard", color: "amber" as const, icon: ShieldCheck };
      default:
        return { msg: "Confirming Status", color: "blue" as const, icon: Lock };
    }
  };

  if (isChecking || !isInitialized) {
    const config = getLoaderConfig();
    return <GenericLoader message={config.msg} color={config.color} Icon={config.icon} />;
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-zinc-950">
      {children}
    </main>
  );
}
