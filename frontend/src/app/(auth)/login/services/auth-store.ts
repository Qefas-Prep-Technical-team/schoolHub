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
  userType: UserType; // Add userType here
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  userType: UserType | null; // Also store it separately for easy access
  setAuth: (user: User, token: string) => void;
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
          userType: user.userType, // Set userType from user object
        });
      },

      setUserType: (userType: UserType) => {
        const state = get();
        // Update both the user object and the separate userType field
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
          userType: null,
        });
      },

      initialize: () => {
        const token = Cookies.get("token");
        const state = get();

        if (token && !state.isAuthenticated) {
          // Token exists but state isn't authenticated - this can happen on page refresh
          // You might want to validate the token with your API here
          console.log("🔄 Re-initializing auth state from token");
        }

        set({ isInitialized: true });
      },

      // Helper methods to check user type
      isParent: () => {
        const state = get();
        return state.userType === "PARENT";
      },

      isTeacher: () => {
        const state = get();
        return state.userType === "TEACHER";
      },

      isAdmin: () => {
        const state = get();
        return state.userType === "ADMIN";
      },

      isStudent: () => {
        const state = get();
        return state.userType === "STUDENT";
      },
    }),
    {
      name: "auth-storage",
    }
  )
);
