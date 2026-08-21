import { apiClient } from '../client';

export const teacherService = {
  getDashboardStats: async (schoolId?: string) => {
    const response = await apiClient.get('/teacher/dashboard-stats', {
      params: { schoolId },
    });
    return response.data.data ?? null;
  }
};
