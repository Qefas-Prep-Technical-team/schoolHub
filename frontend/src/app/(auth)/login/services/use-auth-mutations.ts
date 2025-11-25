/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useAuthStore, UserType } from "./auth-store";
import { useAuthToast, useErrorToast } from "@/lib/hooks/useToast";
import { authAPI } from "./auth-api";

export const useLoginMutation = () => {
  const queryClient = useQueryClient();
  const authToast = useAuthToast();
  const errorToast = useErrorToast();
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: (credentials: {
      email: string;
      password: string;
      userType: UserType; // Use UserType instead of string
    }) => authAPI.login({ ...credentials }),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: ["auth"] });

      // Create user object with userType from the login credentials
      const userWithType = {
        ...response.data.user,
        userType: variables.userType, // Use the userType from the login request
      };

      setAuth(userWithType, response.data.accessToken);
      const userEmail = response.data.user.email;

      authToast.loginSuccess(userEmail);

      // Determine dashboard based on userType from credentials
      const userDash = variables.userType.toLowerCase(); // "PARENT" -> "parent"

      // Use hard redirect to ensure middleware picks up the new cookie
      setTimeout(() => {
        router.push(`/dashboard/${userDash}`);
      }, 1000);
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || "Login failed";
      errorToast.show(errorMessage);
      console.error("Login failed:", error);
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
