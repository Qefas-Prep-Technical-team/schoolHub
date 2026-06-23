import { apiClient } from '../client';

export const gradeService = {
  getStudentGrades: async (studentId?: string, params?: { page?: number; limit?: number; assessmentType?: string | string[] }) => {
    const { data } = await apiClient.get("/academic/grades", {
        params: { studentId, ...params }
    });
    return data;
  },
};
