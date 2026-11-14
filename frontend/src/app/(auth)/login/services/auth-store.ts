// services/auth-store.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import Cookies from "js-cookie";
import { useDashboardStore } from "@/lib/api/hooks/useDashboardStore";
import { useParentStore } from "@/lib/api/hooks/useParentStore";
import { useSessionStore } from "@/store/useSessionStore";
import { useUserStore } from "@/store/useUserStore";

// Define user types as a union for better TypeScript support
export type UserType = "PARENT" | "TEACHER" | "ADMIN" | "STUDENT";

// services/auth-store.ts

interface User {
  id: string;
  email: string;
  name: string; // Add this to store the "fullName"
  role: string | null;
  userType: UserType;
  tenantId?: string; // Internal UUID
  adminCode?: string;
  teacherCode?: string;
  studentCode?: string;
  parentCode?: string;
  phone?: string;
  schools?: { schoolId: string; name: string }[];
  profileImage?: string;
  bannerImage?: string;
  children?: {
    studentId: string;
    studentName: string;
    studentCode: string;
    studentImage?: string;
    linkStatus: string;
  }[];
  trialUsed?: boolean;
  trialEndsAt?: string;
  plan?: string;
  billingCycle?: string;
  subscriptionStatus?: string;
  subscriptionPlanId?: string;
  require2FA?: boolean;
  isTwoFactorEnabled?: boolean;
  tempToken?: string;
  adminRole?: string; // Sub-role for admin users (SCHOOL_OWNER, PRINCIPAL, REGISTRAR, etc.)
  isSchoolOwner?: boolean;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  hasCompletedOnboarding: boolean;
  isInitialized: boolean;
  userType: UserType | null;
  isTransitioning: boolean;
  isLoggingOut: boolean;
  transitionRole: string | null;
  transitionUserName: string | null;
  isLogoutModalOpen: boolean;
  setAuth: (user: User, token: string) => void;
  setPending2FA: (user: User) => void;
  setTransitioning: (
    isTransitioning: boolean,
    role?: string | null,
    userName?: string | null,
  ) => void;
  setLoggingOut: (isLoggingOut: boolean) => void;
  setLogoutModalOpen: (isOpen: boolean) => void;
  setHasCompletedOnboarding: (value: boolean) => void;
  updateUser: (updates: Partial<User>) => void;

  setUserType: (userType: UserType) => void;
  clearAuth: () => void;
  initialize: () => void;
  // Helper selectors
  isParent: () => boolean;
  isTeacher: () => boolean;
  isAdmin: () => boolean;
  isStudent: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      hasCompletedOnboarding: false,
      isInitialized: false,
      userType: null,
      isTransitioning: false,
      transitionRole: null,
      transitionUserName: null,
      isLogoutModalOpen: false,

      isLoggingOut: false,

      setAuth: (user: User, token: string) => {
        if (typeof document !== "undefined") {
          const oauthRefreshToken = Cookies.get("oauth_refresh_token");
          if (oauthRefreshToken) {
            localStorage.setItem("qefas_refresh_token", oauthRefreshToken);
            Cookies.remove("oauth_refresh_token", { path: "/" });
            Cookies.remove("oauth_refresh_token");
          }
          if (token) {
            Cookies.set("token", token, {
              expires: 7,
              path: "/",
              sameSite: "lax",
              secure: process.env.NODE_ENV === "production",
            });
            localStorage.setItem("qefas_access_token", token);
          }
        }

        set({
          user: normalizeUser(user),
          accessToken: token,
          isAuthenticated: true,
          hasCompletedOnboarding: true,
          userType: user.userType,
          isLoggingOut: false, // Reset on login
        });
      },
      setPending2FA: (user: User) => {
        set({
          user: normalizeUser(user),
          isAuthenticated: false, // Ensure they are not fully authenticated yet!
          isLoggingOut: false,
        });
      },
      setHasCompletedOnboarding: (value: boolean) => {
        set({ hasCompletedOnboarding: value });
      },

      setTransitioning: (
        isTransitioning: boolean,
        role?: string | null,
        userName?: string | null,
      ) => {
        set({
          isTransitioning,
          transitionRole: role ?? null,
          transitionUserName: userName ?? null,
        });
      },

      setLoggingOut: (isLoggingOut: boolean) => {
        set({ isLoggingOut });
      },

      setLogoutModalOpen: (isOpen: boolean) => {
        set({ isLogoutModalOpen: isOpen });
      },

      updateUser: (updates: Partial<User>) => {
        const state = get();
        if (!state.user) return;
        const nextUser = normalizeUser({ ...state.user, ...updates });
        set({ user: nextUser });
      },

      setUserType: (userType: UserType) => {
        const state = get();
        const updatedUser = state.user ? { ...state.user, userType } : null;
        set({
          user: updatedUser,
          userType,
        });
      },

      clearAuth: () => {
        Cookies.remove("token", { path: "/" });
        Cookies.remove("token");
        Cookies.remove("refreshToken", { path: "/" });
        Cookies.remove("refreshToken");
        Cookies.remove("oauth_refresh_token", { path: "/" });
        Cookies.remove("oauth_refresh_token");

        // Reset in-memory auxiliary stores before clearing persisted keys
        useDashboardStore.setState({
          selectedSchoolId: "",
          selectedSchoolName: "Personal Dashboard",
          schools: [],
        });
        useParentStore.setState({ selectedChildId: null });
        useSessionStore.getState().clearSession();
        useUserStore.getState().clearUsername();

        set({
          user: null,
          accessToken: null,
          userType: null,
          isAuthenticated: false,
          hasCompletedOnboarding: false,
          isLoggingOut: true, // Flag that we are logging out
          isLogoutModalOpen: false,
          isTransitioning: false,
          transitionRole: null,
          transitionUserName: null,
        });

        // Remove persisted storage after `set` so Zustand persist does not immediately re-write keys
        if (typeof window !== "undefined") {
          localStorage.removeItem("qefas_access_token");
          localStorage.removeItem("qefas_refresh_token");
          localStorage.removeItem("token");
          localStorage.removeItem("auth-storage");
          localStorage.removeItem("dashboard-context");
          localStorage.removeItem("parent-storage");
          localStorage.removeItem("session-storage");
          localStorage.removeItem("user-storage");
          sessionStorage.removeItem("pendingJoinRedirect");
        }
      },

      initialize: () => {
        const state = get();

        // Restore auth state from persisted storage if accessToken is present
        if (state.accessToken && state.user) {
          if (!state.isAuthenticated) {
            console.log("🔄 Restoring auth state from persisted storage");
          }
          set({
            isAuthenticated: true,
            isLoggingOut: false,
          });
        } else {
          // Do NOT delete Cookies.get("token") here: OAuth callbacks (/login/callback) rely
          // on the freshly set token cookie before useAuthStore hydrates.
          set({
            isAuthenticated: false,
            userType: null,
            isLoggingOut: false,
          });
        }

        // Keep client-side cookie synchronized if present in storage/localStorage but missing in cookies
        const fallbackToken = state.accessToken || (typeof window !== "undefined" ? localStorage.getItem("qefas_access_token") : null);
        if (fallbackToken && state.user && typeof document !== "undefined") {
          if (!Cookies.get("token")) {
            Cookies.set("token", fallbackToken, {
              expires: 7,
              path: "/",
              sameSite: "lax",
              secure: process.env.NODE_ENV === "production",
            });
          }
          localStorage.setItem("qefas_access_token", fallbackToken);
        }

        set({ isInitialized: true });
      },

      // Helper methods to check user type
      isParent: () => get().userType === "PARENT",
      isTeacher: () => get().userType === "TEACHER",
      isAdmin: () => get().userType === "ADMIN",
      isStudent: () => get().userType === "STUDENT",
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        userType: state.userType,
        isAuthenticated: state.isAuthenticated,
        hasCompletedOnboarding: state.hasCompletedOnboarding,
      }),
    },
  ),
);

const normalizeUser = (user: User) => {
  const isTwoFactorEnabled =
    user.isTwoFactorEnabled ?? user.require2FA ?? false;

  // Derive adminRole from user, schools list, or isSchoolOwner flag
  const userSchools = (user as any).schools as Array<any> | undefined;
  const schoolAdminRole = userSchools?.find((s) => s.adminRole)?.adminRole || userSchools?.[0]?.adminRole;
  const isSchoolOwner =
    user.isSchoolOwner ??
    (user.adminRole === "SCHOOL_OWNER" ||
      Boolean(userSchools?.some((s) => s.adminRole === "SCHOOL_OWNER")));

  const adminRole =
    user.adminRole ||
    schoolAdminRole ||
    (isSchoolOwner ? "SCHOOL_OWNER" : undefined);

  return {
    ...user,
    adminRole,
    isSchoolOwner,
    require2FA: isTwoFactorEnabled,
    isTwoFactorEnabled,
  };
};

export const resolveUserDashboard = (
  user?: Partial<User> | null,
  userType?: UserType | string | null
): string => {
  // 1. Direct code/entity attribute check (100% unequivocal)
  if (user?.adminCode || user?.adminRole) return "/dashboard/admin";
  if (user?.teacherCode) return "/dashboard/teacher";
  if (user?.studentCode) return "/dashboard/student";
  if (user?.parentCode || (Array.isArray(user?.children) && user.children.length > 0)) {
    return "/dashboard/parent";
  }

  // 2. Normalize candidate role/type string
  const candidate = (userType || user?.userType || user?.role || "").toUpperCase().trim();

  if (
    candidate === "ADMIN" ||
    candidate.includes("ADMIN") ||
    candidate.includes("SCHOOL") ||
    candidate === "PRINCIPAL" ||
    candidate === "REGISTRAR" ||
    candidate === "BURSAR" ||
    candidate === "OWNER"
  ) {
    return "/dashboard/admin";
  }

  if (candidate === "TEACHER" || candidate.includes("TEACH")) {
    return "/dashboard/teacher";
  }

  if (candidate === "STUDENT" || candidate.includes("STUD")) {
    return "/dashboard/student";
  }

  if (candidate === "PARENT" || candidate.includes("PARENT") || candidate.includes("GUARDIAN")) {
    return "/dashboard/parent";
  }

  return "/dashboard";
};

