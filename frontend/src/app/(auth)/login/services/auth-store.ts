// services/auth-store.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import Cookies from "js-cookie";

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
        // We no longer set the client-side 'token' cookie here because
        // the backend sets it as HttpOnly. Attempting to set it here
        // conflicts with the HttpOnly cookie and causes issues.

        console.log(
          "DEBUG: setAuth called with token:",
          token ? "PRESENT" : "MISSING",
        );

        set({
          user: normalizeUser(user),
          accessToken: token,
          isAuthenticated: true,
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
        set({
          user: null,
          accessToken: null,
          isAuthenticated: false,
          hasCompletedOnboarding: false,
          isLoggingOut: true, // Flag that we are logging out
        });
      },

      initialize: () => {
        const token = Cookies.get("token");
        const state = get();

        if (token && !state.isAuthenticated) {
          // console.log("🔄 Re-initializing auth state from token");
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
    },
  ),
);

const normalizeUser = (user: User) => {
  const isTwoFactorEnabled =
    user.isTwoFactorEnabled ?? user.require2FA ?? false;
  return { ...user, require2FA: isTwoFactorEnabled, isTwoFactorEnabled };
};
