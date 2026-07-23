import { apiClient } from '../client';

export interface SchoolStats {
  students: number;
  teachers: number;
  classes: number;
  exams: number;
  subjects: number;
}

export const schoolService = {
  getMyStats: async (): Promise<SchoolStats> => {
    const response = await apiClient.get(`/schools/my/stats`);
    return response.data.data;
  },
};
