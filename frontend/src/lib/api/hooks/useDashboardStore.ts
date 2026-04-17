import { create } from "zustand";
import { persist } from "zustand/middleware";

interface DashboardState {
  selectedSchoolId: string;
  selectedSchoolName: string;
  schools: any[];
  setSchools: (schools: any[]) => void;
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
