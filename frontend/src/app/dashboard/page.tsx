// app/dashboard/page.tsx
"use client"
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../(auth)/login/services/auth-store"
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
      console.log("🚫 Not authenticated, redirecting to login");
      router.push("/login");
      return;
    }

    if (user && userType) {
      setIsRedirecting(true);
           const userDash = userType.toLowerCase() // "PARENT" -> "parent"
     
      // console.log(`🔄 Redirecting to: /dashboard/${userType.toLowerCase()}`);

      // Use replace instead of push to avoid history stack issues
      router.replace(`/dashboard/${userDash}`);
    } else if (user) {
      // Fallback: use user.role if userType is not set
      setIsRedirecting(true);
      const fallbackUserType = user.role || "PARENT";
      console.log(`🔄 Redirecting with fallback: /dashboard/${fallbackUserType.toLowerCase()}`);
      router.replace(`/dashboard/${fallbackUserType.toLowerCase()}`);
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