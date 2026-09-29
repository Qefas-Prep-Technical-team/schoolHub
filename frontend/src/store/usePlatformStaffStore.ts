import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface PlatformStaff {
  id: string;
  fullName: string;
  email: string;
  role: "OWNER" | "FINANCE_ADMIN" | "SUPPORT_AGENT" | "TECH_ADMIN";
}

interface PlatformStaffStore {
  staff: PlatformStaff | null;
  platform_token: string | null;
  isAuthenticated: boolean;
  isHydrated: boolean; // Track when localStorage is loaded
  setStaff: (staff: PlatformStaff, token: string) => void;
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
      clearStaff: () =>
        set({ staff: null, platform_token: null, isAuthenticated: false }),
      setHydrated: (value) => set({ isHydrated: value }),
    }),
    {
      name: "platform-staff-storage",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        // Mark as hydrated after rehydration completes
        state?.setHydrated(true);
      },
    },
  ),
);
