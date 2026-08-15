import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../client';
import { showSuccessToast, showErrorToast } from '@/lib/utils/toast';

export const useStudentProfile = () => {
  return useQuery({
    queryKey: ['studentProfile'],
    queryFn: async () => {
      const response = await apiClient.get('/students/profile');
      return response.data.data;
    },
    retry: 1,
  });
};

export const useUpdateStudentProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await apiClient.patch('/students/profile', data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studentProfile'] });
      showSuccessToast({ title: 'Profile Updated', message: 'Your records have been synchronized successfully.' });
    },
    onError: (error: any) => {
      showErrorToast({ title: 'Update Failed', message: error?.response?.data?.message || 'Unable to update profile.' });
    }
  });
};

export const useRequestEmailUpdate = () => {
  return useMutation({
    mutationFn: async (newEmail: string) => {
      const response = await apiClient.post('/students/profile/email/request', { newEmail });
      return response.data;
    },
    onSuccess: () => {
      showSuccessToast({ title: 'Verification Sent', message: 'Please check your new email for the code.' });
    },
    onError: (error: any) => {
      showErrorToast({ title: 'Request Failed', message: error?.response?.data?.message || 'Unable to process request.' });
    }
  });
};

export const useVerifyEmailUpdate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (code: string) => {
      const response = await apiClient.post('/students/profile/email/verify', { code });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studentProfile'] });
      showSuccessToast({ title: 'Email Verified', message: 'Your email address has been securely updated.' });
    },
    onError: (error: any) => {
      showErrorToast({ title: 'Verification Failed', message: error?.response?.data?.message || 'Invalid or expired code.' });
    }
  });
};

export const useSchoolDepartments = (schoolId?: string) => {
  return useQuery({
    queryKey: ['schoolDepartments', schoolId],
    queryFn: async () => {
      const response = await apiClient.get(`/schools/${schoolId}/departments`);
      return response.data.data;
    },
    enabled: !!schoolId,
    staleTime: 1000 * 60 * 10, // 10 minutes — department list changes rarely
    retry: 1, // Default retry:3 causes 3 retries on offline; 1 is sufficient
  });
};

export const useUpdateDepartment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (departmentId: string) => {
      const response = await apiClient.patch('/students/profile/department', { departmentId });
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studentProfile'] });
      showSuccessToast({ title: 'Department Updated', message: 'Your department has been locked in.' });
    },
    onError: (error: any) => {
      showErrorToast({ title: 'Update Failed', message: error?.response?.data?.message || 'Failed to update department.' });
    }
  });
};

export const useUpdateLevel = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (level: string) => {
      const response = await apiClient.patch('/students/profile/level', { level });
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studentProfile'] });
      showSuccessToast({ title: 'Level Updated', message: 'Your academic level has been locked in.' });
    },
    onError: (error: any) => {
      showErrorToast({ title: 'Update Failed', message: error?.response?.data?.message || 'Failed to update level.' });
    }
  });
};

export const useUpdatePassword = () => {
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await apiClient.post('/auth/password/change', data);
      return response.data;
    },
    onSuccess: () => {
      showSuccessToast({ title: 'Password Updated', message: 'Your security credentials have been changed.' });
    },
    onError: (error: any) => {
      showErrorToast({ title: 'Update Failed', message: error?.response?.data?.message || 'Failed to update password.' });
    }
  });
};

export const useDeviceSessions = () => {
  return useQuery({
    queryKey: ['deviceSessions'],
    queryFn: async () => {
      const response = await apiClient.get('/auth/sessions');
      return response.data.data;
    },
    staleTime: 1000 * 60 * 10, // 10 minutes — session list changes infrequently
  });
};

export const useRevokeSession = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete(`/auth/sessions/${id}`);
      return response.data;
    },
    onSuccess: (_data, _variables) => {
      queryClient.invalidateQueries({ queryKey: ['deviceSessions'] });
      showSuccessToast({ title: 'Session Revoked', message: 'The device has been successfully logged out.' });
    },
    onError: (error: any) => {
      showErrorToast({ title: 'Revocation Failed', message: error?.response?.data?.message || 'Unable to revoke session.' });
    }
  });
};

export const useStudentAttendance = (studentId: string, filters?: { startDate?: string; endDate?: string }) => {
  return useQuery({
    queryKey: ['studentAttendance', studentId, filters],
    queryFn: async () => {
      const response = await apiClient.get(`/students/${studentId}/attendance`, { params: filters });
      return response.data.data;
    },
    enabled: !!studentId,
  });
};

export const useStudentBehaviourProfile = (studentId: string) => {
  return useQuery({
    queryKey: ['student', studentId, 'behaviour-profile'],
    queryFn: async () => {
      const response = await apiClient.get(`/students/${studentId}/behaviour-profile`);
      return response.data.data;
    },
    enabled: !!studentId,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
};
