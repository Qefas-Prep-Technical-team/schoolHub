import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface GradeThreshold {
  grade: string;
  minPercentage: number;
  color: string;
}

interface GradeSettingsState {
  gradingScale: GradeThreshold[];
  updateThreshold: (grade: string, minPercentage: number) => void;
  resetToDefault: () => void;
}

const defaultScale: GradeThreshold[] = [
  { grade: 'A', minPercentage: 90, color: 'text-emerald-600 dark:text-emerald-400' },
  { grade: 'B', minPercentage: 80, color: 'text-blue-600 dark:text-blue-400' },
  { grade: 'C', minPercentage: 70, color: 'text-amber-600 dark:text-amber-400' },
  { grade: 'D', minPercentage: 60, color: 'text-orange-600 dark:text-orange-400' },
  { grade: 'E', minPercentage: 50, color: 'text-orange-400 dark:text-orange-300' },
  { grade: 'F', minPercentage: 0, color: 'text-red-600 dark:text-red-400' },
];

export const useGradeSettingsStore = create<GradeSettingsState>()(
  persist(
    (set) => ({
      gradingScale: defaultScale,
      updateThreshold: (grade, minPercentage) =>
        set((state) => ({
          gradingScale: state.gradingScale.map((t) =>
            t.grade === grade ? { ...t, minPercentage } : t
          ).sort((a, b) => b.minPercentage - a.minPercentage),
        })),
      resetToDefault: () => set({ gradingScale: defaultScale }),
    }),
    {
      name: 'grade-settings-storage',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: (state) => {
        return (rehydratedState) => {
          if (rehydratedState) {
            // Migration: Ensure 'E' exists in the scale for existing users
            const hasE = rehydratedState.gradingScale.some((t) => t.grade === 'E');
            if (!hasE) {
              const newScale = [
                ...rehydratedState.gradingScale.filter(t => t.grade !== 'F'),
                { grade: 'E', minPercentage: 50, color: 'text-orange-400 dark:text-orange-300' },
                ...rehydratedState.gradingScale.filter(t => t.grade === 'F')
              ].sort((a, b) => b.minPercentage - a.minPercentage);
              rehydratedState.gradingScale = newScale;
            }
          }
        };
      },
    }
  )
);
