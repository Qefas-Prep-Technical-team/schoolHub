import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ExamCreationState {
  currentExamId: string | null;
  schoolId: string | null;
  sessionId: string | null;
  
  // Actions
  setExamContext: (examId: string, schoolId?: string, sessionId?: string) => void;
  clearExamContext: () => void;
}

export const useExamStore = create<ExamCreationState>()(
  persist(
    (set) => ({
      currentExamId: null,
      schoolId: null,
      sessionId: null,

      setExamContext: (examId, schoolId, sessionId) => set((state) => ({ 
        currentExamId: examId,
        schoolId: schoolId || state.schoolId,
        sessionId: sessionId || state.sessionId
      })),

      clearExamContext: () => set({ currentExamId: null })
    }),
    {
      name: 'exam-creation-storage',
    }
  )
);
