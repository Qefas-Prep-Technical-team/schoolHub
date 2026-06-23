import { apiClient } from '../client';

export const examService = {
  getMyExamAttempts: async (params?: Record<string, unknown>) => {
    const { data } = await apiClient.get("/exams/my/attempts", { params });
    return data;
  },
};
