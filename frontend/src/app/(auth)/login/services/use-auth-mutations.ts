/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useAuthStore } from "./auth-store";
import { useAuthToast, useErrorToast } from "@/lib/hooks/useToast";
import { authAPI } from "./auth-api";

export const useLoginMutation = () => {
  const queryClient = useQueryClient();
  const setAuth = useAuthStore((state) => state.setAuth);
  const authToast = useAuthToast();
  const errorToast = useErrorToast();

  return useMutation({
    mutationFn: (credentials: { email: string; password: string }) =>
      authAPI.login({ ...credentials, userType: "PARENT" }),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["auth"] });
      setAuth(response.data.user, response.data.accessToken);
      const user = response.data.user.email;

      authToast.loginSuccess(user);
      console.log("Parent login successful:", response.data);

      // Use hard redirect to ensure middleware picks up the new cookie
      setTimeout(() => {
        window.location.href = "/dashboard/parent";
      }, 1000);
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || "Login failed";
      errorToast.show(errorMessage);
      console.error("Parent login failed:", error);
      throw error;
    },
  });
};
export const useLogoutMutation = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const authToast = useAuthToast();
  const errorToast = useErrorToast();

  return useMutation({
    mutationFn: authAPI.logout,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth"] });
      clearAuth();
      authToast.logoutSuccess();
      console.log("Logout successful");

      // Redirect to login after logout
      router.push("/login");
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || "Logout failed";
      errorToast.show(errorMessage);
      console.error("Logout failed:", error);
      // Clear auth even if API call fails and redirect
      clearAuth();
      router.push("/login");
    },
  });
};
