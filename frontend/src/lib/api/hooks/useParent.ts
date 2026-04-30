import { useMutation, useQueryClient } from "@tanstack/react-query";
import { parentService } from "../services/parentService";
import { useToast } from "@/lib/hooks/useToast";
import { useAuthStore } from "@/app/(auth)/login/services/auth-store";

export const useUpdateParentProfile = () => {
  const queryClient = useQueryClient();
  const toast = useToast();
  const { updateUser } = useAuthStore();

  return useMutation({
    mutationFn: (data: { 
      name?: string; 
      email?: string; 
      phone?: string;
      profileImage?: string;
      bannerImage?: string;
    }) => parentService.updateProfile(data),
    onSuccess: (updatedData) => {
      // Update local auth store with new data, mapping backend fields to frontend expectations
      updateUser({
        ...updatedData,
        name: updatedData.fullName || updatedData.name
      });
      queryClient.invalidateQueries({ queryKey: ["parent-profile"] });
      toast.success.show("Profile updated successfully");
    },
    onError: (error: any) => {
      toast.error.show(error.response?.data?.message || "Failed to update profile");
    },
  });
};
