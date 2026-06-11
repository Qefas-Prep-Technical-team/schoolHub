import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface DashboardSchool {
  id: string;
  name: string;
  logo?: string;
  address?: string;
  phone?: string;
  email?: string;
  linkingCode?: string;
  schoolCode?: string;
}

interface DashboardState {
  selectedSchoolId: string;
  selectedSchoolName: string;
  schools: DashboardSchool[];
  setSchools: (schools: DashboardSchool[]) => void;
  setSelectedSchoolId: (schoolId: string, schoolName: string) => void;
}

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set) => ({
      selectedSchoolId: "",
      selectedSchoolName: "Personal Dashboard",
      schools: [],
      setSchools: (schools) => set({ schools }),
      setSelectedSchoolId: (schoolId, schoolName) => set({ selectedSchoolId: schoolId, selectedSchoolName: schoolName }),
    }),
    {
      name: "dashboard-context",
      partialize: (state) => ({ 
        selectedSchoolId: state.selectedSchoolId, 
        selectedSchoolName: state.selectedSchoolName 
      }),
    }
  )
);
