import { useQuery } from "@tanstack/react-query";
import { schoolService, SchoolStats } from "../services/schoolService";
import { paymentService } from "../services/paymentService";

export const schoolQueryKeys = {
  all: ["school"] as const,
  stats: (schoolId: string) =>
    [...schoolQueryKeys.all, "stats", schoolId] as const,
  teachers: (schoolId: string) =>
    [...schoolQueryKeys.all, "teachers", schoolId] as const,
  performance: (schoolId: string) =>
    [...schoolQueryKeys.all, "performance", schoolId] as const,
  students: (schoolId: string, params?: Record<string, unknown>) =>
    [...schoolQueryKeys.all, "students", schoolId, params] as const,
  dashboardSummary: (schoolId: string) =>
    [...schoolQueryKeys.all, "dashboard-summary", schoolId] as const,
  billing: (schoolId: string, params?: Record<string, unknown>) =>
    [...schoolQueryKeys.all, "billing", schoolId, params] as const,
  userBilling: (userId: string, params?: Record<string, unknown>) =>
    ["user", "billing", userId, params] as const,
};

export const useSchoolStats = (schoolId: string) => {
  return useQuery({
    queryKey: schoolQueryKeys.stats(schoolId),
    queryFn: () => schoolService.getStats(schoolId),
    enabled: !!schoolId,
  });
};

export const useSchoolTeachers = (schoolId: string) => {
  return useQuery({
    queryKey: schoolQueryKeys.teachers(schoolId),
    queryFn: () => schoolService.getTeachers(schoolId),
    enabled: !!schoolId,
  });
};

export const useSchoolPerformanceAnalysis = (
  schoolId: string,
  stats?: SchoolStats,
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: [
      ...schoolQueryKeys.performance(schoolId),
      stats ? JSON.stringify(stats) : "no-stats",
    ],
    queryFn: async () => {
      const cacheKey = `ai_analysis_${schoolId}`;
      const cached = localStorage.getItem(cacheKey);

      // If we have stats and a cached result, check if the stats match the cached stats
      if (cached && stats) {
        try {
          const parsedCache = JSON.parse(cached);
          // Auto-bust the cache if it contains a locked/premium result —
          // this handles plan upgrades where stats haven't changed yet
          if (parsedCache.data?.isPremium === true) {
            console.log("Cached analysis is premium-locked, busting cache for fresh fetch");
            localStorage.removeItem(cacheKey);
          } else if (JSON.stringify(parsedCache.stats) === JSON.stringify(stats)) {
            console.log("Using cached AI analysis report");
            return parsedCache.data;
          }
        } catch (e) {
          console.error("Failed to parse cached analysis", e);
        }
      }

      // If no cache or stats changed, fetch new analysis
      const data = await schoolService.getPerformanceAnalysis(schoolId);

      // Store new analysis with current stats
      if (stats) {
        localStorage.setItem(cacheKey, JSON.stringify({ stats, data }));
      }

      return data;
    },
    enabled: !!schoolId && !!stats && (options?.enabled !== false),
    staleTime: Infinity,
    gcTime: 1000 * 60 * 60 * 24, // 24 hours
  });
};

export const useSchoolStudents = (
  schoolId: string,
  params?: Record<string, unknown>,
) => {
  return useQuery({
    queryKey: schoolQueryKeys.students(schoolId, params),
    queryFn: () => schoolService.getStudents(schoolId, params),
    enabled: !!schoolId,
  });
};

export const useSchoolProfile = (schoolId: string) => {
  return useQuery({
    queryKey: [...schoolQueryKeys.all, "profile", schoolId],
    queryFn: () => schoolService.getProfile(schoolId),
    enabled: !!schoolId,
  });
};

import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useUpdateSchoolProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      schoolId,
      data,
    }: {
      schoolId: string;
      data: Record<string, unknown>;
    }) => schoolService.updateProfile(schoolId, data),
    onSuccess: (_, { schoolId }) => {
      queryClient.invalidateQueries({
        queryKey: [...schoolQueryKeys.all, "profile", schoolId],
      });
      queryClient.invalidateQueries({
        queryKey: schoolQueryKeys.stats(schoolId),
      });
    },
  });
};

export const useSchoolSettings = (schoolId: string) => {
  return useQuery({
    queryKey: [...schoolQueryKeys.all, "settings", schoolId],
    queryFn: () => schoolService.getSettings(schoolId),
    enabled: !!schoolId,
  });
};

export const useUpdateSchoolSettings = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      schoolId,
      data,
    }: {
      schoolId: string;
      data: Record<string, unknown>;
    }) => schoolService.updateSettings(schoolId, data),
    onSuccess: (_, { schoolId }) => {
      queryClient.invalidateQueries({
        queryKey: [...schoolQueryKeys.all, "settings", schoolId],
      });
    },
  });
};

export const useSchoolDashboardSummary = (schoolId: string) => {
  return useQuery({
    queryKey: schoolQueryKeys.dashboardSummary(schoolId),
    queryFn: () => schoolService.getDashboardSummary(schoolId),
    enabled: !!schoolId,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};

export const useSchoolBilling = (
  schoolId: string,
  params?: { page?: number; limit?: number },
) => {
  return useQuery({
    queryKey: schoolQueryKeys.billing(schoolId, params),
    queryFn: () => schoolService.getBilling(schoolId, params),
    enabled: !!schoolId,
    staleTime: 0, // Always consider data stale
    gcTime: 0, // Zero caching - remove from memory immediately when unmounted
    refetchOnMount: "always", // Enforce real-time server fetch on every page visit
    refetchOnWindowFocus: true, // Re-fetch when user returns to tab/page after checkout
  });
};

export const useUserBilling = (
  userId: string,
  params?: { page?: number; limit?: number },
) => {
  return useQuery({
    queryKey: schoolQueryKeys.userBilling(userId, params),
    queryFn: () => paymentService.getBilling(params),
    enabled: !!userId,
    staleTime: 0,
    gcTime: 0, // Zero caching - remove from memory immediately when unmounted
    refetchOnMount: "always", // Enforce real-time server fetch on every page visit
    refetchOnWindowFocus: true,
  });
};

export const useSchoolLandingPage = (schoolId: string) => {
  return useQuery({
    queryKey: [...schoolQueryKeys.all, "landing-page", schoolId],
    queryFn: () => schoolService.getLandingPage(schoolId),
    enabled: !!schoolId,
  });
};

export const useSchoolLandingPageBySubdomain = (subdomain: string) => {
  return useQuery({
    queryKey: [...schoolQueryKeys.all, "landing-page-subdomain", subdomain],
    queryFn: () => schoolService.getLandingPageBySubdomain(subdomain),
    enabled: !!subdomain,
  });
};

export const useUpdateSchoolLandingPage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      schoolId,
      data,
    }: {
      schoolId: string;
      data: Record<string, unknown>;
    }) => schoolService.updateLandingPage(schoolId, data),
    onSuccess: (_, { schoolId }) => {
      queryClient.invalidateQueries({
        queryKey: [...schoolQueryKeys.all, "landing-page", schoolId],
      });
    },
  });
};

export const useSchoolTodayAttendance = (schoolId: string, date?: string) => {
  return useQuery({
    queryKey: [...schoolQueryKeys.all, 'today-attendance', schoolId, date || 'today'],
    queryFn: () => schoolService.getTodayAttendance(schoolId, date),
    enabled: !!schoolId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
