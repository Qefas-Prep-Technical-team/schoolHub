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
  subscriptionStatus?: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  hasCompletedOnboarding: boolean;
  isInitialized: boolean;
  userType: UserType | null;
  setAuth: (user: User, token: string) => void;
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

      setAuth: (user: User, token: string) => {
        Cookies.set("token", token, {
          expires: 1,
          path: "/",
          sameSite: "lax",
          secure: process.env.NODE_ENV === "production",
        });

        set({
          user,
          accessToken: token,
          isAuthenticated: true,
          userType: user.userType,
        });
      },
      setHasCompletedOnboarding: (value: boolean) => {
        set({ hasCompletedOnboarding: value });
      },

      updateUser: (updates: Partial<User>) => {
        const state = get();
        if (!state.user) return;
        set({ user: { ...state.user, ...updates } });
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
          userType: null,
        });
      },

      initialize: () => {
        const token = Cookies.get("token");
        const state = get();

        if (token && !state.isAuthenticated) {
          console.log("🔄 Re-initializing auth state from token");
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
