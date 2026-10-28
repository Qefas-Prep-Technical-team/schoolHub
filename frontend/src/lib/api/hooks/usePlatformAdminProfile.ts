import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { platformClient } from "@/lib/api/platformClient";
import { toast } from "react-toastify";

export interface PlatformStaffProfileData {
  id: string;
  fullName: string;
  displayName?: string | null;
  agentDisplayName?: string | null;
  email: string;
  role: "OWNER" | "TECH_ADMIN" | "FINANCE_ADMIN" | "SUPPORT_AGENT";
  phone?: string | null;
  bio?: string | null;
  profileImage?: string | null;
  googleId?: string | null;
  facebookId?: string | null;
  githubId?: string | null;
  linkedinId?: string | null;
  twitterId?: string | null;
  socialLinks?: Record<string, string>;
  isTwoFactorEnabled?: boolean;
  lastLoginAt?: string | null;
  createdAt?: string;
}

export interface UpdateProfilePayload {
  fullName?: string;
  displayName?: string | null;
  agentDisplayName?: string | null;
  email?: string;
  phone?: string | null;
  bio?: string | null;
  profileImage?: string | null;
  socialLinks?: Record<string, string>;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export interface LinkSocialPayload {
  provider: "google" | "github" | "linkedin" | "twitter" | "facebook";
  action: "link" | "unlink";
  identifier?: string;
}

/**
 * Fetch current authenticated platform staff profile
 */
export const usePlatformStaffProfile = () => {
  return useQuery({
    queryKey: ["platform-staff-profile"],
    queryFn: async () => {
      const res = await platformClient.get<{ success: boolean; data: PlatformStaffProfileData }>("/platform/auth/me");
      return res.data.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  });
};

/**
 * Mutation to update profile details
 */
export const useUpdatePlatformStaffProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: UpdateProfilePayload) => {
      const res = await platformClient.patch<{ success: boolean; message: string; data: PlatformStaffProfileData }>(
        "/platform/auth/profile",
        payload
      );
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["platform-staff-profile"] });
      toast.success(data.message || "Profile updated successfully!");
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || "Failed to update profile";
      toast.error(msg);
    },
  });
};

/**
 * Mutation to change password
 */
export const useChangePlatformStaffPassword = () => {
  return useMutation({
    mutationFn: async (payload: ChangePasswordPayload) => {
      const res = await platformClient.patch<{ success: boolean; message: string }>(
        "/platform/auth/password",
        payload
      );
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || "Password changed successfully!");
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || "Failed to change password";
      toast.error(msg);
    },
  });
};

/**
 * Mutation to link/unlink social account
 */
export const useLinkPlatformSocial = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: LinkSocialPayload) => {
      const res = await platformClient.post<{ success: boolean; message: string; data: any }>(
        "/platform/auth/social-link",
        payload
      );
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["platform-staff-profile"] });
      toast.success(data.message);
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || "Failed to update social link";
      toast.error(msg);
    },
  });
};
