import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ParentState {
  selectedChildId: string | null;
  setSelectedChildId: (id: string | null) => void;
}

export const useParentStore = create<ParentState>()(
  persist(
    (set) => ({
      selectedChildId: null,
      setSelectedChildId: (id: string | null) => set({ selectedChildId: id }),
    }),
    {
      name: "parent-storage",
    }
  )
);
