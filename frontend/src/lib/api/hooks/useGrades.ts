import { useQuery } from "@tanstack/react-query";
import { gradeService } from "../services/gradeService";

export const gradeKeys = {
  all: ["grades"] as const,
  lists: () => [...gradeKeys.all, "list"] as const,
  list: (filters: any) => [...gradeKeys.lists(), filters] as const,
  admin: (filters: any) => [...gradeKeys.all, "admin", filters] as const,
  details: () => [...gradeKeys.all, "detail"] as const,
  detail: (id: string) => [...gradeKeys.details(), id] as const,
  hub: (filters: any) => [...gradeKeys.all, "hub", filters] as const,
};

export const useStudentGrades = (studentId?: string) => {
  return useQuery({
    queryKey: gradeKeys.list({ studentId }),
    queryFn: () => gradeService.getStudentGrades(studentId),
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

export const useGradeHub = (schoolId: string, filters?: any) => {
  return useQuery({
    queryKey: gradeKeys.hub({ schoolId, ...filters }),
    queryFn: () => gradeService.getGradeHub(schoolId, filters),
    enabled: !!schoolId,
  });
};
