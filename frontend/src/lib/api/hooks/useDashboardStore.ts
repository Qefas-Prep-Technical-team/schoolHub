import { create } from "zustand";

interface DashboardState {
  selectedSchoolId: string;
  schools: any[];
  setSchools: (schools: any[]) => void;
  setSelectedSchoolId: (schoolId: string) => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  selectedSchoolId: "",
  schools: [],
  setSchools: (schools) => set({ schools }),
  setSelectedSchoolId: (schoolId) => set({ selectedSchoolId: schoolId }),
}));
