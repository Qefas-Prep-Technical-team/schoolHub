import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../client';

interface SubscriptionUsageData {
  planName: string;
  limits: {
    students: number;
    exams: number;
    classes: number;
    storageGb: number;
  };
  usage: {
    students: number;
    exams: number;
    classes: number;
    storageGb: number;
  };
  percentages: {
    students: number;
    exams: number;
    classes: number;
    storage: number;
  };
  isTrial: boolean;
}

export const useSubscriptionUsage = () => {
  return useQuery({
    queryKey: ['subscription-usage'],
    queryFn: async () => {
      // Use apiClient to ensure the correct base URL and Authorization headers are applied
      const { data } = await apiClient.get<{ success: boolean, data: SubscriptionUsageData }>('/subscription/usage');
      return data.data;
    },
    // Refresh every 5 minutes or when the window is refocused
    staleTime: 5 * 60 * 1000,
  });
};
