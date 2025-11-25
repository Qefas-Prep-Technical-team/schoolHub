// hooks/useRouteGuard.ts
"use client";

import { useAuthStore } from "@/app/(auth)/login/services/auth-store";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

export const useRouteGuard = (allowedRoles?: string[]) => {
  const router = useRouter();
  const pathname = usePathname();
  const { user, accessToken } = useAuthStore();

  useEffect(() => {
    if (!accessToken) {
      router.push("/login");
      return;
    }

    // If you want role-based protection
    if (allowedRoles && user && !allowedRoles.includes(user.role as string)) {
      router.push("/unauthorized");
    }
  }, [pathname, accessToken, user]);
};
