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
  subjectPaperId: string | null;
  examAttemptId: string | null;
  createdAt: string;
  updatedAt: string;
  exam?: {
    title: string;
    session?: {
      name: string;
    }
  };
  subjectPaper?: {
    title: string;
    subject?: {
      name: string;
    }
  };
}

export const gradeService = {
  getStudentGrades: async (studentId?: string, params?: { page?: number; limit?: number }) => {
    const { data } = await apiClient.get<{ 
      success: boolean; 
      grades: Grade[]; 
      pagination: { total: number; page: number; limit: number; totalPages: number } 
    }>("/academic/grades", {
        params: { studentId, ...params }
    });
    return data;
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
  },

  getGradeHub: async (schoolId: string, filters?: any) => {
    const { data } = await apiClient.get("/grades/hub", {
      params: { schoolId, ...filters }
    });
    return data.data;
  },

  createGradeEntry: async (gradeData: any) => {
    const { data } = await apiClient.post("/grades", gradeData);
    return data.data;
  },

  updateGradeScore: async (id: string, score: number, remarks?: string) => {
    const { data } = await apiClient.patch(`/grades/${id}`, { score, remarks });
    return data.data;
  },

  processOCR: async (imageUrl: string) => {
    const { data } = await apiClient.post("/grades/ocr", { imageUrl });
    return data.data;
  },

  bulkCreateGrades: async (schoolId: string, grades: any[]) => {
    const { data } = await apiClient.post("/grades/bulk", { schoolId, grades });
    return data.data;
  }
};
