import { apiClient } from '../client';

export const examService = {
  getMyExamAttempts: async (params?: Record<string, unknown>) => {
    const { data } = await apiClient.get("/exams/my/attempts", { params });
    return data;
  },
  getExams: async (params?: Record<string, unknown>) => {
    const { data } = await apiClient.get("/exams", { params });
    return data?.data || data;
  },
  getExam: async (id: string) => {
    const { data } = await apiClient.get(`/exams/${id}`);
    return data;
  },
  getExamAttempt: async (examId: string) => {
    const { data } = await apiClient.get(`/exams/${examId}/attempt`);
    return data;
  },
  startExamAttempt: async (examId: string, options?: { deviceId?: string }) => {
    const { data } = await apiClient.post(`/exams/${examId}/start`, options);
    return data;
  },
  getExamReview: async (examId: string) => {
    const { data } = await apiClient.get(`/exams/${examId}/review`);
    return data?.data || data;
  },
  submitAttempt: async (examId: string) => {
    const { data } = await apiClient.post(`/exams/${examId}/submit`);
    return data;
  },
  saveAnswer: async (examId: string, payload: { subjectPaperId: string, questionId: string, answer: string }) => {
    const { data } = await apiClient.post(`/exams/${examId}/answers`, payload);
    return data;
  },
};
