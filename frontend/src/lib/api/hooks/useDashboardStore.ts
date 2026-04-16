import { create } from "zustand";

interface DashboardState {
  selectedSchoolId: string;
  selectedSchoolName: string;
  schools: any[];
  setSchools: (schools: any[]) => void;
  setSelectedSchoolId: (schoolId: string, schoolName: string) => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  selectedSchoolId: "",
  selectedSchoolName: "Personal Dashboard",
  schools: [],
  setSchools: (schools) => set({ schools }),
  setSelectedSchoolId: (schoolId, schoolName) => set({ selectedSchoolId: schoolId, selectedSchoolName: schoolName }),
}));
