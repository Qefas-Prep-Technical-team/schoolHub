import { create } from "zustand";
import { persist } from "zustand/middleware";
import Cookies from "js-cookie";

interface User {
  id: string;
  email: string;
  role: string | null;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,

      setAuth: (user: User, token: string) => {
        // Set cookie with name "token" for middleware
        Cookies.set("token", token, {
          expires: 1, // 1 day
          path: "/",
          sameSite: "lax",
          secure: process.env.NODE_ENV === "production",
        });
        console.log("🔐 Token cookie set for middleware");
        set({ user, accessToken: token, isAuthenticated: true });
      },

      clearAuth: () => {
        Cookies.remove("token", { path: "/" });
        console.log("🔐 Token cookie removed");
        set({ user: null, accessToken: null, isAuthenticated: false });
      },
    }),
    {
      name: "auth-storage",
    }
  )
);
