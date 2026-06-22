import { useQuery } from "@tanstack/react-query";
import { examService } from "../services/examService";

export const useStudentExamAttempts = (params?: { page?: number; limit?: number }) => {
  return useQuery({
    queryKey: ["my-attempts", params],
    queryFn: () => examService.getMyExamAttempts(params),
  });
};
