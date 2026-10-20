// app/dashboard/page.tsx
"use client"
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore, resolveUserDashboard } from "../(auth)/login/services/auth-store"
import LoadingDashboard from "@/components/reuseables/LoadingDashboard";

export default function DashboardPage() {
  const router = useRouter();
  const { userType, isAuthenticated, user, isInitialized } = useAuthStore();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    // Wait for auth store to initialize
    if (!isInitialized) return;

    // Prevent multiple redirects
    if (isRedirecting) return;

    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    if (user) {
      setIsRedirecting(true);
      const targetDashboard = resolveUserDashboard(user, userType);
      router.replace(targetDashboard);
    } else {
      // Authenticated but user is null (e.g. corrupted persisted state)
      // Clear the invalid state and redirect to login
      useAuthStore.getState().clearAuth();
      router.replace("/login");
    }
  }, [user, isAuthenticated, userType, router, isInitialized, isRedirecting]);

  // Show loading while auth is initializing
  if (!isInitialized) {
    return <LoadingDashboard  />;
  }

  // Show loading while checking authentication
  if (!isAuthenticated) {
    return <LoadingDashboard />;
  }

  // Show loading while preparing redirect
  return (
    <LoadingDashboard
      userType={userType}
     
    />
  );
}
