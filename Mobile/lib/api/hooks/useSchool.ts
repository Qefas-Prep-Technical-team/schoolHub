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

export const useSessions = (schoolId?: string) => {
  return useQuery({
    queryKey: ['sessions', schoolId],
    queryFn: () => schoolService.getSessions(schoolId),
    enabled: !!schoolId,
    staleTime: 1000 * 60 * 60, // 1 hour
  });
};

export const useMyPerformanceAnalysis = (statsOrSchoolId?: any) => {
  const schoolId = typeof statsOrSchoolId === 'string' ? statsOrSchoolId : statsOrSchoolId?.schoolId;
  return useQuery({
    queryKey: ['mySchoolPerformanceAnalysis', schoolId ?? 'my'],
    queryFn: async () => {
      if (schoolId) return await schoolService.getPerformanceAnalysis(schoolId);
      return await schoolService.getMyPerformanceAnalysis();
    },
    // Always enabled — if no schoolId provided it uses the /my/ endpoint
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
};

export const useMyDashboardSummary = () => {
  return useQuery({
    queryKey: ['myDashboardSummary'],
    queryFn: async () => {
      return await schoolService.getMyDashboardSummary();
    },
    staleTime: 1000 * 60 * 5,      // 5 minutes — staff data is not real-time
    refetchInterval: 1000 * 60 * 5, // refetch every 5 min, not every 30s
  });
};

export const useMyTodayAttendance = (date?: string) => {
  return useQuery({
    queryKey: ['myTodayAttendance', date || 'today'],
    queryFn: async () => {
      return await schoolService.getMyTodayAttendance(date);
    },
    staleTime: 1000 * 60 * 5,
  });
};

export const useSchoolProfile = (schoolId: string) => {
  return useQuery({
    queryKey: ['schoolProfile', schoolId],
    queryFn: () => schoolService.getSchoolProfile(schoolId),
    enabled: !!schoolId,
    staleTime: 1000 * 60 * 60, // 1 hour
  });
};

export const useSchoolSettings = (schoolId: string) => {
  return useQuery({
    queryKey: ['schoolSettings', schoolId],
    queryFn: () => schoolService.getSchoolSettings(schoolId),
    enabled: !!schoolId,
    staleTime: 1000 * 60 * 60, // 1 hour
  });
};
