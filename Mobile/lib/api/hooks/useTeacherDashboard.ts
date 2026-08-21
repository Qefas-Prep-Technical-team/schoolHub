import { useQuery } from '@tanstack/react-query';
import { teacherService } from '../services/teacherService';

export const useTeacherDashboardStats = (schoolId?: string) => {
  return useQuery({
    queryKey: ['teacherDashboardStats', schoolId],
    queryFn: () => teacherService.getDashboardStats(schoolId),
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
    retry: 1,
  });
};
