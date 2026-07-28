import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../client";

interface FeatureAccessResponse {
  success: boolean;
  hasAccess: boolean;
  error?: string;
}

export const useFeatureAccess = (featureKey: string, schoolId?: string) => {
  return useQuery({
    queryKey: ['feature-access', featureKey, schoolId],
    queryFn: async () => {
      try {
        const queryParams = schoolId ? `?schoolId=${schoolId}` : '';
        const { data } = await apiClient.get<FeatureAccessResponse>(`/subscription/check-feature/${featureKey}${queryParams}`);
        return data?.hasAccess ?? (data as any)?.data?.hasAccess ?? false;
      } catch (error: any) {
        // If 403 or 401 or network error, assume false
        console.error(`[useFeatureAccess] Failed to check feature ${featureKey}:`, error);
        return false;
      }
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes to reduce API calls
    retry: false, // Don't retry if it fails (likely 403 or 401)
  });
};
