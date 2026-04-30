import { useQuery } from "@tanstack/react-query";
import { parentService } from "../services/parentService";

export const useChildExams = (childId: string | null) => {
  return useQuery({
    queryKey: ["child-exams", childId],
    queryFn: async () => {
      if (!childId) return null;
      return await parentService.getChildDetails(childId);
    },
    enabled: !!childId,
  });
};
