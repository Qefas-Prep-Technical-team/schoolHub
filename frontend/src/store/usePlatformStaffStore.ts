import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import Cookies from "js-cookie";

interface PlatformStaff {
  id: string;
  fullName: string;
  displayName?: string | null;
  email: string;
  role: "OWNER" | "FINANCE_ADMIN" | "SUPPORT_AGENT" | "TECH_ADMIN";
  profileImage?: string | null;
  phone?: string | null;
  bio?: string | null;
}

interface PlatformStaffStore {
  staff: PlatformStaff | null;
  platform_token: string | null;
  isAuthenticated: boolean;
  isHydrated: boolean; // Track when localStorage is loaded
  setStaff: (staff: PlatformStaff, token: string) => void;
  updateStaff: (partial: Partial<PlatformStaff>) => void;
  clearStaff: () => void;
  setHydrated: (value: boolean) => void;
}

export const usePlatformStaffStore = create<PlatformStaffStore>()(
  persist(
    (set) => ({
      staff: null,
      platform_token: null,
      isAuthenticated: false,
      isHydrated: false,
      setStaff: (staff, token) =>
        set({ staff, platform_token: token, isAuthenticated: true }),
      updateStaff: (partial) =>
        set((state) => ({
          staff: state.staff ? { ...state.staff, ...partial } : null,
        })),
      clearStaff: () => {
        Cookies.remove("platform_token", { path: "/" });
        Cookies.remove("platform_token");
        Cookies.remove("token", { path: "/" });
        Cookies.remove("token");
        set({ staff: null, platform_token: null, isAuthenticated: false });
        if (typeof window !== "undefined") {
          localStorage.removeItem("platform-staff-storage");
          localStorage.removeItem("token");
        }
      },
      setHydrated: (value) => set({ isHydrated: value }),
    }),
    {
      name: "platform-staff-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        staff: state.staff,
        platform_token: state.platform_token,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        // Mark as hydrated after rehydration completes
        state?.setHydrated(true);
      },
    },
  ),
);
