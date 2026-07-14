// hooks/useProtectedRoute.ts
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/app/(auth)/login/services/auth-store";

interface UseProtectedRouteOptions {
  redirectTo?: string;
  requireAuth?: boolean;
  userTypes?: string[];
}

export function useProtectedRoute(options: UseProtectedRouteOptions = {}) {
  const { redirectTo = "/login", requireAuth = true, userTypes = [] } = options;

  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, user } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);
  // console.log("🔐 useProtectedRoute: isAuthenticated =", isAuthenticated);

  useEffect(() => {
    const checkAuth = async () => {
      setIsChecking(true);

      // If authentication is required but user is not authenticated
      if (requireAuth && !isAuthenticated) {
        // console.log("🔐 Redirecting to login: Not authenticated");
        router.push(`${redirectTo}?redirect=${encodeURIComponent(pathname)}`);
        return;
      }

      // If user is authenticated but shouldn't be on auth pages (like login)
      if (!requireAuth && isAuthenticated) {
        // console.log("🔐 Redirecting to dashboard: Already authenticated");
        const dashPath = user?.userType ? `/dashboard/${user.userType.toLowerCase().replace('_', '-')}` : "/dashboard";
        router.replace(dashPath);
        return;
      }

      // Check if user is an ADMIN without a plan
      if (requireAuth && isAuthenticated && user?.userType === 'ADMIN') {
        const hasPlan = !!user.plan;
        const isExcludedPath = pathname.includes('/select-plan') || pathname.includes('/checkout');
        
        if (!hasPlan && !isExcludedPath) {
          router.replace('/select-plan');
          return;
        }
      }

      // Check user type restrictions
      if (requireAuth && isAuthenticated && userTypes.length > 0) {
        const userRole = user?.role?.toUpperCase();
        const hasAccess = userTypes.some(
          (type) => type.toUpperCase() === userRole
        );

        if (!hasAccess) {
          // console.log("🔐 Redirecting: User type not allowed");
          router.push("/unauthorized");
          return;
        }
      }

      setIsChecking(false);
    };

    checkAuth();
  }, [
    isAuthenticated,
    requireAuth,
    router,
    redirectTo,
    pathname,
    userTypes,
    user,
  ]);

  return { isChecking, isAuthenticated, user };
}
