import { useQuery } from '@tanstack/react-query';
import { adminService } from '../services/adminService';

const FIVE_MINUTES = 1000 * 60 * 5;

export const useAdminStudents = (
  schoolId: string | undefined | null,
  page: number = 1,
  limit: number = 20,
  search?: string,
  filters?: Record<string, unknown>
) => {
  return useQuery({
    queryKey: ['adminStudents', schoolId, page, limit, search, filters],
    queryFn: async () => {
      if (!schoolId) return { data: [], total: 0 };
      return await adminService.getSchoolStudents(schoolId, page, limit, search, filters);
    },
    enabled: !!schoolId,
    staleTime: FIVE_MINUTES,
  });
};

export const useAdminTeachers = (
  schoolId: string | undefined | null,
  params?: { search?: string; isClaimed?: string }
) => {
  return useQuery({
    queryKey: ['adminTeachers', schoolId, params],
    queryFn: async () => {
      if (!schoolId) return [];
      // Limit capped at 50 — was 500. Fetching 500 records per mount creates
      // a large payload on every admin screen load. Pagination should be used
      // for schools with many teachers.
      const res = await adminService.getSchoolTeachers(schoolId, { limit: 50, ...params });
      // API returns { data: Teacher[] } or Teacher[] directly
      return (res?.data ?? res) as unknown[];
    },
    enabled: !!schoolId,
    staleTime: FIVE_MINUTES, // Teacher rosters change infrequently
  });
};

export const useSchoolTeacherAttendanceTrend = (
  schoolId: string | undefined | null,
  days = 5
) => {
  return useQuery({
    queryKey: ['teacherAttendanceTrend', schoolId, days],
    queryFn: async () => {
      if (!schoolId) return [];
      return await adminService.getSchoolTeacherAttendanceTrend(schoolId, days);
    },
    enabled: !!schoolId,
    staleTime: FIVE_MINUTES,
  });
};
