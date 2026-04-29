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
  setStaff: (staff: PlatformStaff, token: string) => void;
  clearStaff: () => void;
}

export const usePlatformStaffStore = create<PlatformStaffStore>()(
  persist(
    (set) => ({
      staff: null,
      platform_token: null,
      isAuthenticated: false,
      setStaff: (staff, token) => set({ staff, platform_token: token, isAuthenticated: true }),
      clearStaff: () => set({ staff: null, platform_token: null, isAuthenticated: false }),
    }),
    {
      name: "platform-staff-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
