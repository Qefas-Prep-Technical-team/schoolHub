import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient as api } from '../client';

export interface Assignment {
  id: string;
  title: string;
  subjectId: string;
  instructorId: string;
  dueDate: string;
  status: 'pending' | 'submitted' | 'graded' | 'overdue';
  progress: number;
  grade: string | null;
  submissionDate?: string;
  totalMarks: number;
  questionCount: number;
}

export const useStudentAssignments = (params?: { page?: number; limit?: number; status?: string }) => {
  return useQuery({
    queryKey: ['studentAssignments', params],
    queryFn: async () => {
      const response = await api.get('/api/v1/assignment/student', { params });
      return response.data.data;
    },
  });
};

export const useTeacherAssignments = (schoolId: string, status?: string) => {
  return useQuery<{ assignments: Assignment[], total: number, pages: number }, Error>({
    queryKey: ['assignments', 'teacher', schoolId, status],
    queryFn: async () => {
      const response = await api.get('/api/v1/assignment/teacher', {
        headers: { 'x-school-id': schoolId },
        params: { status }
      });
      return response.data.data;
    },
    enabled: !!schoolId,
  });
};

export const useAdminAssignments = (schoolId: string, status?: string) => {
  return useQuery<{ assignments: Assignment[], total: number, pages: number }, Error>({
    queryKey: ['assignments', 'admin', schoolId, status],
    queryFn: async () => {
      const response = await api.get('/api/v1/assignment/admin', {
        headers: { 'x-school-id': schoolId },
        params: { status }
      });
      return response.data.data;
    },
    enabled: !!schoolId,
  });
};

export const useCreateAssignment = (schoolId: string, isAdmin: boolean = false) => {
  const queryClient = useQueryClient();
  const endpoint = isAdmin ? '/api/v1/assignment/admin' : '/api/v1/assignment/teacher';

  return useMutation({
    mutationFn: async (data: {
      title: string;
      classIds: string[];
      subjectId: string;
      instructions?: string;
      dueDate?: string;
      maxScore?: number;
      status?: string;
      attachments?: string[];
    }) => {
      const response = await api.post(endpoint, data, {
        headers: { 'x-school-id': schoolId },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
    },
  });
};

export const useAssignmentById = (id: string) => {
  return useQuery({
    queryKey: ['assignment', id],
    queryFn: async () => {
      const response = await api.get(`/api/v1/assignment/student/${id}`);
      return response.data.data;
    },
    enabled: !!id,
  });
};

export const useSubmitAssignment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: { fileUrl?: string; fileName?: string; answers?: any[] } }) => {
      const response = await api.post(`/api/v1/assignment/student/${id}/submit`, data);
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['studentAssignments'] });
      queryClient.invalidateQueries({ queryKey: ['assignment', variables.id] });
    },
  });
};
