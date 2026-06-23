import { useQuery } from "@tanstack/react-query";
import { gradeService } from "../services/gradeService";

export const useGrades = (studentId?: string, params?: { page?: number; limit?: number; assessmentType?: string | string[] }) => {
  return useQuery({
    queryKey: ["student-grades", studentId, params],
    queryFn: () => gradeService.getStudentGrades(studentId, params),
  });
};
