import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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

export const useAssignmentById = (id: string) => {
  return useQuery({
    queryKey: ['assignment', id],
    queryFn: async () => {
      const response = await apiClient.get(`/assignment/student/${id}`);
      return response.data.data;
    },
    enabled: !!id,
  });
};

export const useSubmitAssignment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: { fileUrl?: string; fileName?: string; answers?: any[]; isDraft?: boolean } }) => {
      const response = await apiClient.post(`/assignment/student/${id}/submit`, data);
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['studentAssignments'] });
      queryClient.invalidateQueries({ queryKey: ['assignment', variables.id] });
    },
  });
};
