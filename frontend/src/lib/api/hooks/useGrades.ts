import { useQuery } from "@tanstack/react-query";
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

export const useStudentGrades = (studentId?: string, params?: { page?: number; limit?: number }) => {
  return useQuery({
    queryKey: gradeKeys.list({ studentId, ...params }),
    queryFn: () => gradeService.getStudentGrades(studentId, params),
  });
};

export const useGrades = useStudentGrades;

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
