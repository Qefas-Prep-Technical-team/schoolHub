import { apiClient } from "../client";

export const recordService = {
  getClassSubjectResults: async (params?: Record<string, any>) => {
    const response = await apiClient.get<{ success: boolean; data: any[] }>("/records/class-subjects", {
      params,
    });
    return response.data.data;
  },

  getStudentTermResults: async (params?: Record<string, any>) => {
    const response = await apiClient.get<{ success: boolean; data: any[] }>("/records/student-terms", {
      params,
    });
    return response.data.data;
  },

  getMyPublishedResults: async () => {
    const response = await apiClient.get<{ success: boolean; data: any[] }>("/records/my-results");
    return response.data.data;
  },

  createClassSubjectResult: async (data: Record<string, any>) => {
    const response = await apiClient.post<{ success: boolean; data: any; message: string }>("/records/class-subjects", data);
    return response.data;
  },

  getClassSubjectResultById: async (id: string) => {
    const response = await apiClient.get<{ success: boolean; data: any }>(`/records/class-subjects/${id}`);
    return response.data.data;
  },

  updateClassSubjectResult: async (id: string, data: Record<string, any>) => {
    const response = await apiClient.patch<{ success: boolean; data: any; message: string }>(`/records/class-subjects/${id}`, data);
    return response.data;
  },

  getStudentSubjectResults: async (params: Record<string, any>) => {
    const response = await apiClient.get<{ success: boolean; data: any[] }>("/records/student-subject-results", {
      params,
    });
    return response.data.data;
  },

  bulkUpsertStudentSubjectResults: async (data: Record<string, any>) => {
    const response = await apiClient.post<{ success: boolean; message: string }>("/records/student-subject-results/bulk", data);
    return response.data;
  },

  updatePaperLinks: async (id: string, paperLinks: Record<string, string[]>) => {
    const response = await apiClient.patch<{ success: boolean; data: any }>(`/records/class-subjects/${id}/paper-links`, { paperLinks });
    return response.data;
  },

  calculatePaperSync: async (id: string, studentIds: string[], category?: string) => {
    const response = await apiClient.post<{ success: boolean; data: any }>(`/records/class-subjects/${id}/calculate-sync`, { studentIds, category });
    return response.data.data;
  },

  getStudentScoreBreakdown: async (id: string, studentId: string) => {
    const response = await apiClient.get<{ success: boolean; data: any }>(`/records/class-subjects/${id}/student/${studentId}/score-breakdown`);
    return response.data.data;
  },

  publishClassSubjectResult: async (id: string) => {
    const response = await apiClient.post<{ success: boolean; message: string; data: any }>(`/records/class-subjects/${id}/publish`);
    return response.data;
  },

  unpublishClassSubjectResult: async (id: string) => {
    const response = await apiClient.post<{ success: boolean; message: string; data: any }>(`/records/class-subjects/${id}/unpublish`);
    return response.data;
  },
};
