import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../client';

interface SubscriptionUsageData {
  planName: string;
  limits: {
    students: number;
    exams: number;
    classes: number;
    teachers: number;
    storageGb: number;
    aiUsage: number;
  };
  usage: {
    students: number;
    exams: number;
    classes: number;
    teachers: number;
    storageGb: number;
    aiUsage: number;
  };
  percentages: {
    students: number;
    exams: number;
    classes: number;
    teachers: number;
    storage: number;
    aiUsage: number;
  };
  planFeatures: Array<{
    name: string;
    label: string;
    enabled: boolean;
    limit: number | null;
    isUnlimited: boolean;
  }>;
  isTrial: boolean;
  subscriptionStatus: string;
}

export const useSubscriptionUsage = (enabled: boolean = true) => {
  return useQuery({
    queryKey: ['subscription-usage'],
    queryFn: async () => {
      // Use apiClient to ensure the correct base URL and Authorization headers are applied
      const { data } = await apiClient.get<{ success: boolean, data: SubscriptionUsageData }>('/subscription/usage');
      return data.data;
    },
    enabled: enabled,
    // Always consider data stale — re-fetch on every mount
    staleTime: 0,
    refetchOnWindowFocus: true,
  });
};
