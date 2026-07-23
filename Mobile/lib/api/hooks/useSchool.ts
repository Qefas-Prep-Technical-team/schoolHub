import { useQuery } from '@tanstack/react-query';
import { schoolService } from '../services/schoolService';

export const useMySchoolStats = () => {
  return useQuery({
    queryKey: ['mySchoolStats'],
    queryFn: async () => {
      return await schoolService.getMyStats();
    },
    retry: 1,
  });
};
