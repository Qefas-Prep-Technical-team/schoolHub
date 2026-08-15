import { useQuery } from "@tanstack/react-query";
import { parentService, ParentDashboardData } from "../services/parentService";

export const useParentDashboard = (childId?: string | null) => {
  return useQuery<ParentDashboardData | null>({
    queryKey: ["parentDashboard", childId],
    queryFn: () => parentService.getParentDashboard(childId || undefined),
    staleTime: 3 * 60 * 1000,
    retry: 1,
  });
};
