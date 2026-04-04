import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { studentService } from "../services/studentService";
import { toast } from "react-toastify";

export const studentKeys = {
  all: ["students"] as const,
  profile: () => [...studentKeys.all, "profile"] as const,
};

export const useStudentProfile = () => {
  return useQuery({
    queryKey: studentKeys.profile(),
    queryFn: () => studentService.getProfile(),
  });
};

export const useUpdateStudentProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { 
      name?: string; 
      email?: string; 
      gender?: string; 
      dateOfBirth?: string | Date;
      profileImage?: string;
      bannerImage?: string;
    }) =>
      studentService.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: studentKeys.profile() });
      toast.success("Profile updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update profile");
    },
  });
};

export const useRequestEmailUpdate = () => {
  return useMutation({
    mutationFn: (newEmail: string) => studentService.requestEmailUpdate(newEmail),
    onSuccess: (data) => {
      toast.success(data.message || "Verification code sent!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to request email update");
    },
  });
};

export const useVerifyEmailUpdate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (code: string) => studentService.verifyEmailUpdate(code),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: studentKeys.profile() });
      toast.success(data.message || "Email updated successfully!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to verify code");
    },
  });
};

export const useStudents = (schoolId: string, filters: Record<string, string | boolean | undefined> = {}) => {
  return useQuery({
    queryKey: [...studentKeys.all, schoolId, filters],
    queryFn: () => studentService.getSchoolStudents(schoolId, filters),
    enabled: !!schoolId,
  });
};
