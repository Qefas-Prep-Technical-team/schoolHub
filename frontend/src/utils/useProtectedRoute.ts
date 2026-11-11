// hooks/useProtectedRoute.ts
//DONE:
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
        router.push("/dashboard");
        return;
      }

      // Check user type restrictions
      if (requireAuth && isAuthenticated && userTypes.length > 0) {
        const userRole = (user?.userType || user?.role || user?.adminRole)?.toUpperCase();
        const isAdminRole = userRole === 'ADMIN' || userRole === 'SCHOOL_OWNER' || userRole === 'SUPER_ADMIN' || !!user?.adminRole || !!user?.isSchoolOwner;
        const hasAccess = userTypes.some((type) => {
          const upperType = type.toUpperCase();
          if (upperType === userRole) return true;
          if ((upperType === 'ADMIN' || upperType === 'SCHOOL_OWNER') && isAdminRole) return true;
          return false;
        });

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
