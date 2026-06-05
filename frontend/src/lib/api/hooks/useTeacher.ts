import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { teacherService } from "../services/teacherService";
import { toast } from "react-toastify";
import { AxiosError } from "axios";

export const teacherKeys = {
  all: ["teachers"] as const,
  profile: () => [...teacherKeys.all, "profile"] as const,
  dashboard: (schoolId?: string) => [...teacherKeys.all, "dashboard", schoolId || "all"] as const,
  linkedSchools: () => [...teacherKeys.all, "linked-schools"] as const,
};

export const useTeacherProfile = () => {
  return useQuery({
    queryKey: teacherKeys.profile(),
    queryFn: () => teacherService.getProfile(),
  });
};

export const useUpdateTeacherProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { 
      name?: string; 
      gender?: string; 
      dateOfBirth?: string | Date;
      profileImage?: string;
      bannerImage?: string;
    }) =>
      teacherService.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teacherKeys.profile() });
      toast.success("Profile updated successfully");
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || "Failed to update profile");
    },
  });
};

export const useRequestTeacherEmailUpdate = () => {
  return useMutation({
    mutationFn: (newEmail: string) => teacherService.requestEmailUpdate(newEmail),
    onSuccess: (data) => {
      toast.success(data.message || "Verification code sent!");
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || "Failed to request email update");
    },
  });
};

export const useVerifyTeacherEmailUpdate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (code: string) => teacherService.verifyEmailUpdate(code),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: teacherKeys.profile() });
      toast.success(data.message || "Email updated successfully!");
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || "Failed to verify code");
    },
  });
};

export const useTeacherDashboardStats = (schoolId?: string) => {
  return useQuery({
    queryKey: teacherKeys.dashboard(schoolId),
    queryFn: () => teacherService.getDashboardStats(schoolId),
  });
};

export const useTeacherLinkedSchools = () => {
  return useQuery({
    queryKey: teacherKeys.linkedSchools(),
    queryFn: () => teacherService.getLinkedSchools(),
  });
};

export const useTeacherSettings = () => {
  return useQuery({
    queryKey: [...teacherKeys.all, "settings"],
    queryFn: () => teacherService.getSettings(),
  });
};

export const useUpdateTeacherSettings = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (settings: Record<string, unknown>) => teacherService.updateSettings(settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...teacherKeys.all, "settings"] });
      toast.success("Settings updated successfully");
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || "Failed to update settings");
    },
  });
};

export const useTeacherClasses = (schoolId?: string) => {
  return useQuery({
    queryKey: [...teacherKeys.all, "classes", { schoolId }],
    queryFn: () => teacherService.getClasses({ schoolId }),
    enabled: !!schoolId,
  });
};

export const useTeacherSubjects = (schoolId?: string) => {
  return useQuery({
    queryKey: [...teacherKeys.all, "subjects", { schoolId }],
    queryFn: () => teacherService.getSubjects({ schoolId }),
    enabled: !!schoolId,
  });
};
