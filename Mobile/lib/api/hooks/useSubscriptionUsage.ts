import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../client';

export const subscriptionService = {
  getUsage: async () => {
    const { data } = await apiClient.get('/subscription/usage');
    return data.data || data;
  }
};

export const useSubscriptionUsage = () => {
  return useQuery({
    queryKey: ['subscription-usage'],
    queryFn: () => subscriptionService.getUsage(),
    staleTime: 1000 * 60 * 5,
  });
};
