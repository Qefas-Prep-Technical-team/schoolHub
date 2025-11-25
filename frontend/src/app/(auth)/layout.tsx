"use client"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import LoadingDashboard from "@/components/reuseables/LoadingDashboard";
import { useProtectedRoute } from '@/hooks/useProtectedRoute';
import { useAuthStore } from "./login/services/auth-store";


// app/(auth)/layout.tsx
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()
  const {  userType } = useAuthStore();

  const { isChecking } = useProtectedRoute({
    requireAuth: false,
    redirectTo: '/dashboard'
  });

  if (isChecking) {
    return <LoadingDashboard message="Checking session..." userType={userType} />;
  }

  return (
    <main className="min-h-screen flex items-center justify-center ">
      {children}
    </main>
  );
}
