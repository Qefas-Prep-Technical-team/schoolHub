// services/auth-store.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import Cookies from "js-cookie";

// Define user types as a union for better TypeScript support
export type UserType = "PARENT" | "TEACHER" | "ADMIN" | "STUDENT";

interface User {
  id: string;
  email: string;
  role: string | null;
  userType: UserType;
  defaultTenantId?: string; // Add defaultTenantId to the user object
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  userType: UserType | null;
  defaultTenantId: string | null; // Store separately for easy access
  setAuth: (user: User, token: string) => void;
  setUserType: (userType: UserType) => void;
  setDefaultTenantId: (tenantId: string) => void; // New setter
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
      isInitialized: false,
      userType: null,
      defaultTenantId: null,

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
          defaultTenantId: user.defaultTenantId || null,
        });
      },

      setUserType: (userType: UserType) => {
        const state = get();
        const updatedUser = state.user ? { ...state.user, userType } : null;
        set({
          user: updatedUser,
          userType,
        });
      },

      setDefaultTenantId: (tenantId: string) => {
        const state = get();
        const updatedUser = state.user ? { ...state.user, defaultTenantId: tenantId } : null;
        set({
          user: updatedUser,
          defaultTenantId: tenantId,
        });
      },

      clearAuth: () => {
        Cookies.remove("token", { path: "/" });
        set({
          user: null,
          accessToken: null,
          isAuthenticated: false,
          userType: null,
          defaultTenantId: null,
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
    }
  )
);
