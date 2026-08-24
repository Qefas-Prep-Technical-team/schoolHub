import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../client';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  profileImage?: string;
  role: string;
  parentCode?: string;
  plan?: string;
  trialEndsAt?: string;
  primarySchoolId?: string;
  activeSchoolId?: string;
  tenantId?: string;
  schools?: { schoolId: string; role?: string }[];
}

/**
 * Shared hook for fetching the authenticated user's profile.
 * staleTime: Infinity — the auth user does not change mid-session.
 * Only refetched when the query is manually invalidated (e.g. after a profile update).
 */
export const useAuthUser = () => {
  return useQuery<AuthUser>({
    queryKey: ['authUser'],
    queryFn: async () => {
      const res = await apiClient.get('/auth/me');
      return res.data.data as AuthUser;
    },
    staleTime: Infinity, // User profile never goes stale mid-session
    retry: 1,
  });
};
