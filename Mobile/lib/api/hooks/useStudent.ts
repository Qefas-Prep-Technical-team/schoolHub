import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../client';
import Toast from 'react-native-toast-message';

export const useStudentProfile = () => {
  return useQuery({
    queryKey: ['studentProfile'],
    queryFn: async () => {
      // Matches frontend studentService.ts: getProfile()
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
      Toast.show({
        type: 'success',
        text1: 'Profile Updated',
        text2: 'Your records have been synchronized successfully.',
      });
    },
    onError: (error: any) => {
      Toast.show({
        type: 'error',
        text1: 'Update Failed',
        text2: error?.response?.data?.message || 'Unable to update profile.',
      });
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
      Toast.show({
        type: 'success',
        text1: 'Verification Sent',
        text2: 'Please check your new email for the code.',
      });
    },
    onError: (error: any) => {
      Toast.show({
        type: 'error',
        text1: 'Request Failed',
        text2: error?.response?.data?.message || 'Unable to process request.',
      });
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
      Toast.show({
        type: 'success',
        text1: 'Email Verified',
        text2: 'Your email address has been securely updated.',
      });
    },
    onError: (error: any) => {
      Toast.show({
        type: 'error',
        text1: 'Verification Failed',
        text2: error?.response?.data?.message || 'Invalid or expired code.',
      });
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
      Toast.show({
        type: 'success',
        text1: 'Department Updated',
        text2: 'Your department has been locked in.',
      });
    },
    onError: (error: any) => {
      Toast.show({
        type: 'error',
        text1: 'Update Failed',
        text2: error?.response?.data?.message || 'Failed to update department.',
      });
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
      Toast.show({
        type: 'success',
        text1: 'Level Updated',
        text2: 'Your academic level has been locked in.',
      });
    },
    onError: (error: any) => {
      Toast.show({
        type: 'error',
        text1: 'Update Failed',
        text2: error?.response?.data?.message || 'Failed to update level.',
      });
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
      Toast.show({
        type: 'success',
        text1: 'Password Updated',
        text2: 'Your security credentials have been changed.',
      });
    },
    onError: (error: any) => {
      Toast.show({
        type: 'error',
        text1: 'Update Failed',
        text2: error?.response?.data?.message || 'Failed to update password.',
      });
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
  });
};

export const useRevokeSession = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete(`/auth/sessions/${id}`);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['deviceSessions'] });
      Toast.show({
        type: 'success',
        text1: 'Session Revoked',
        text2: 'The device has been successfully logged out.',
      });
    },
    onError: (error: any) => {
      Toast.show({
        type: 'error',
        text1: 'Revocation Failed',
        text2: error?.response?.data?.message || 'Unable to revoke session.',
      });
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

