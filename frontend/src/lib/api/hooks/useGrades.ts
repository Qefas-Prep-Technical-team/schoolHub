import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { gradeService } from "../services/gradeService";

export const gradeKeys = {
  all: ["grades"] as const,
  lists: () => [...gradeKeys.all, "list"] as const,
  list: (filters: Record<string, unknown>) => [...gradeKeys.lists(), filters] as const,
  admin: (filters: Record<string, unknown>) => [...gradeKeys.all, "admin", filters] as const,
  details: () => [...gradeKeys.all, "detail"] as const,
  detail: (id: string) => [...gradeKeys.details(), id] as const,
  hub: (filters: Record<string, unknown>) => [...gradeKeys.all, "hub", filters] as const,
};

export const useGrades = (studentId?: string, params?: { page?: number; limit?: number; assessmentType?: string | string[] }) => {
  return useQuery({
    queryKey: gradeKeys.list({ studentId, ...params }),
    queryFn: () => gradeService.getStudentGrades(studentId, params),
    staleTime: 1000 * 60 * 2, // 2 minutes
    retry: 1,
  });
};

export const useClassLeaderboard = (classId?: string) => {
  return useQuery({
    queryKey: gradeKeys.list({ action: "leaderboard", classId }),
    queryFn: () => gradeService.getClassLeaderboard(classId!),
    enabled: !!classId,
    staleTime: 1000 * 60 * 5, // Leaderboards don't change frequently (5 mins)
    retry: 1,
  });
};

export const useAdminGrades = (filters?: { classId?: string; subject?: string; includeExams?: boolean }) => {
  return useQuery({
    queryKey: gradeKeys.admin(filters || {}),
    queryFn: () => gradeService.getAdminGrades(filters),
    staleTime: 1000 * 60 * 2, // 2 minutes
    retry: 1,
  });
};

export const useGrade = (id: string) => {
  return useQuery({
    queryKey: gradeKeys.detail(id),
    queryFn: () => gradeService.getGradeById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 2,
    retry: false,
  });
};

export const useGradeHub = (schoolId: string, filters?: Record<string, unknown>) => {
  return useQuery({
    queryKey: gradeKeys.hub({ schoolId, ...filters }),
    queryFn: () => gradeService.getGradeHub(schoolId, filters),
    enabled: !!schoolId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  });
};

export const useUpdateGrade = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { status?: string; score?: number; remarks?: string } }) => gradeService.updateGradeScore(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: gradeKeys.all });
    },
  });
};

export const usePublishGrade = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => gradeService.publishGrade(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: gradeKeys.all });
    },
  });
};

export const useDeleteGrade = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => gradeService.deleteGrade(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: gradeKeys.all });
    },
  });
};
