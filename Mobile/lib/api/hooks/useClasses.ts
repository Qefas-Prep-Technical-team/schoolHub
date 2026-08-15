import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../client';

export const useClasses = (schoolId?: string) => {
  return useQuery({
    queryKey: ['classes', { schoolId }],
    queryFn: async () => {
      const response = await apiClient.get(`/classes${schoolId ? `?schoolId=${schoolId}` : ''}`);
      return response.data.data || [];
    },
  });
};

export const useSingleClass = (id: string) => {
  return useQuery({
    queryKey: ['classes', 'detail', id],
    queryFn: async () => {
      const response = await apiClient.get(`/classes/${id}`);
      return response.data.data;
    },
    enabled: !!id,
  });
};

export const useClassTimetable = (classId: string, termPeriodId?: string) => {
  return useQuery({
    queryKey: ['classes', 'timetable', classId, { termPeriodId }],
    queryFn: async () => {
      // In mobile, we might not always pass termPeriodId initially
      const url = termPeriodId 
        ? `/classes/${classId}/timetable?termPeriodId=${termPeriodId}`
        : `/classes/${classId}/timetable`;
      const response = await apiClient.get(url);
      return response.data.data || [];
    },
    enabled: !!classId,
  });
};

export const useClassBehaviourAlerts = (classId: string, studentId?: string) => {
  return useQuery({
    queryKey: ['class', classId, 'behaviour-alerts', { studentId }],
    queryFn: async () => {
      const response = await apiClient.get(`/classes/${classId}/behaviour-alerts`, { params: { studentId } });
      return response.data.data;
    },
    enabled: !!classId,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
};

