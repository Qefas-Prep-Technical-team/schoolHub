import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../client';

export const useSubjectScheme = (subjectId: string) => {
  return useQuery({
    queryKey: ['subjectScheme', subjectId],
    queryFn: async () => {
      const response = await apiClient.get(`/subjects/${subjectId}/scheme`);
      return response.data.data;
    },
    enabled: !!subjectId,
  });
};
