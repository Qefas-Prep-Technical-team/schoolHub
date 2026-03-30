import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Exam, SubjectPaper } from "@/lib/api/services/examService";

interface ExamState {
  currentExam: Exam | null;
  currentPaper: SubjectPaper | null;
  setCurrentExam: (exam: Exam | null) => void;
  setCurrentPaper: (paper: SubjectPaper | null) => void;
  reset: () => void;
}

export const useExamStore = create<ExamState>()(
  persist(
    (set) => ({
      currentExam: null,
      currentPaper: null,
      setCurrentExam: (exam) => set({ currentExam: exam }),
      setCurrentPaper: (paper) => set({ currentPaper: paper }),
      reset: () => set({ currentExam: null, currentPaper: null }),
    }),
    {
      name: 'exam-storage',
    }
  )
);
