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
  });
};

export const useClassLeaderboard = (classId?: string) => {
  return useQuery({
    queryKey: gradeKeys.list({ action: "leaderboard", classId }),
    queryFn: () => gradeService.getClassLeaderboard(classId!),
    enabled: !!classId,
  });
};

export const useAdminGrades = (filters?: { classId?: string; subject?: string }) => {
  return useQuery({
    queryKey: gradeKeys.admin(filters || {}),
    queryFn: () => gradeService.getAdminGrades(filters),
  });
};

export const useGrade = (id: string) => {
  return useQuery({
    queryKey: gradeKeys.detail(id),
    queryFn: () => gradeService.getGradeById(id),
    enabled: !!id,
  });
};

export const useGradeHub = (schoolId: string, filters?: Record<string, unknown>) => {
  return useQuery({
    queryKey: gradeKeys.hub({ schoolId, ...filters }),
    queryFn: () => gradeService.getGradeHub(schoolId, filters),
    enabled: !!schoolId,
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
