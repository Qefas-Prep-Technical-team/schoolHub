"use client"
import { useAuthStore } from "./login/services/auth-store";
import GenericLoader from "@/components/reuseables/GenericLoader";
import { useProtectedRoute } from '@/hooks/useProtectedRoute';
import { ShieldCheck, GraduationCap, Users, UserCog, Lock } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const { userType, isInitialized, isAuthenticated } = useAuthStore();

  // Redirect to dashboard if they are already logged in
  // const { isChecking } = useProtectedRoute({
  //   requireAuth: false,
  //   redirectTo: `/dashboard/${userType?.toLowerCase() || ''}`
  // });

  const getLoaderConfig = () => {
    switch (userType) {
      case "STUDENT": return { msg: "Entering Student Portal", color: "blue" as const, icon: GraduationCap };
      case "TEACHER": return { msg: "Accessing Faculty Suite", color: "emerald" as const, icon: Users };
      case "ADMIN":   return { msg: "Secure Admin Access", color: "rose" as const, icon: UserCog };
      case "PARENT":  return { msg: "Opening Parent Dashboard", color: "amber" as const, icon: ShieldCheck };
      default:        return { msg: "Confirming Status", color: "blue" as const, icon: Lock };
    }
  };

  // Show the fast, clean GenericLoader during security checks
  // if (isChecking || !isInitialized) {
  //   const config = getLoaderConfig();
  //   return <GenericLoader message={config.msg} color={config.color} Icon={config.icon} />;
  // }

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-zinc-950">
      {children}
    </main>
  );
}