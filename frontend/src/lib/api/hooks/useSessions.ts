import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../client";

export const useSessions = (schoolId: string) => {
  return useQuery({
    queryKey: ["sessions", schoolId],
    queryFn: async () => {
      console.log("Fetching sessions for school:", schoolId);
      const { data } = await apiClient.get(`/sessions?schoolId=${schoolId}`);
      console.log("Fetched sessions data:", data);
      return data;
    },
    enabled: !!schoolId, // The trigger: only fetch when schoolId is present
    staleTime: 1000 * 60 * 5,
  });
};
