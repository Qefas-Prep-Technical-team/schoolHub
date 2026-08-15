import { useMutation, useQueryClient } from "@tanstack/react-query";
import { parentService } from "../services/parentService";
import { Alert } from "react-native";

export const useUpdateParentProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      name?: string;
      email?: string;
      phone?: string;
      profileImage?: string;
      bannerImage?: string;
    }) => parentService.updateProfile(data),
    onSuccess: () => {
      // Invalidate both the generic auth user and the parent dashboard queries
      queryClient.invalidateQueries({ queryKey: ['authUser'] });
      Alert.alert("Success", "Profile updated successfully");
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Failed to update profile";
      Alert.alert("Error", message);
    },
  });
};
