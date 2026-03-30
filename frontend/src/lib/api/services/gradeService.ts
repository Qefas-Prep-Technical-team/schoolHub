import { apiClient } from "../client";

export interface Grade {
  id: string;
  studentId: string;
  student?: {
    name: string;
    studentCode: string;
  };
  schoolId: string;
  teacherId: string | null;
  classId: string | null;
  class?: {
    name: string;
    section: string;
  };
  subject: string;
  assessmentType: string;
  score: number;
  maxMarks: number;
  remarks: string | null;
  examId: string | null;
  examAttemptId: string | null;
  createdAt: string;
  updatedAt: string;
  exam?: {
    title: string;
    session?: {
      name: string;
    }
  };
}

export const gradeService = {
  getStudentGrades: async (studentId?: string) => {
    const { data } = await apiClient.get<{ success: boolean; data: Grade[] }>("/academic/grades", {
        params: { studentId }
    });
    return data.data || [];
  },

  getAdminGrades: async (params?: { classId?: string; subject?: string }) => {
    const { data } = await apiClient.get<{ success: boolean; data: Grade[] }>("/academic/grades/admin", {
        params
    });
    return data.data || [];
  },
  
  getGradeById: async (id: string) => {
    const { data } = await apiClient.get<{ success: boolean; data: Grade }>(`/academic/grades/${id}`);
    return data.data;
  }
};
