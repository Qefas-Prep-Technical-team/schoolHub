import { useQuery } from "@tanstack/react-query";
import { schoolService } from "../services/schoolService";

export const schoolQueryKeys = {
  all: ["school"] as const,
  stats: (schoolId: string) => [...schoolQueryKeys.all, "stats", schoolId] as const,
  teachers: (schoolId: string) => [...schoolQueryKeys.all, "teachers", schoolId] as const,
  performance: (schoolId: string) => [...schoolQueryKeys.all, "performance", schoolId] as const,
  students: (schoolId: string, params?: any) => [...schoolQueryKeys.all, "students", schoolId, params] as const,
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

export const useSchoolPerformanceAnalysis = (schoolId: string) => {
  return useQuery({
    queryKey: schoolQueryKeys.performance(schoolId),
    queryFn: () => schoolService.getPerformanceAnalysis(schoolId),
    enabled: !!schoolId,
  });
};

export const useSchoolStudents = (schoolId: string, params?: any) => {
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
    mutationFn: ({ schoolId, data }: { schoolId: string; data: any }) =>
      schoolService.updateProfile(schoolId, data),
    onSuccess: (_, { schoolId }) => {
      queryClient.invalidateQueries({ queryKey: [...schoolQueryKeys.all, "profile", schoolId] });
      queryClient.invalidateQueries({ queryKey: schoolQueryKeys.stats(schoolId) });
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
    mutationFn: ({ schoolId, data }: { schoolId: string; data: any }) =>
      schoolService.updateSettings(schoolId, data),
    onSuccess: (_, { schoolId }) => {
      queryClient.invalidateQueries({ queryKey: [...schoolQueryKeys.all, "settings", schoolId] });
    },
  });
};
