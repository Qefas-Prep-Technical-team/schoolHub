import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../client';

export const useStudentAssignments = (params?: { page?: number; limit?: number; status?: string }) => {
  return useQuery({
    queryKey: ['studentAssignments', params],
    queryFn: async () => {
      const response = await apiClient.get('/assignment/student', { params });
      return response.data.data;
    },
  });
};
