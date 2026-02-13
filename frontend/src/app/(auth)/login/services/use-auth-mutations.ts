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
  // useLoginMutation logic
onSuccess: (response:any, variables) => {
  queryClient.invalidateQueries({ queryKey: ["auth"] });
console.log(response)
  const userWithType = {
    ...response.data.user,
    // Ensure 'name' is populated. Fallback to 'fullName' if that's what backend sends
    name: response.data.user.name || response.data.user.fullName || "User",
    userType: variables.userType,
  };

  setAuth(userWithType, response.data.accessToken);
  
  // Use the name for the toast!
  authToast.loginSuccess(userWithType.name); 

  const userDash = variables.userType.toLowerCase();

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


      // Redirect to login after logout
      router.push("/login");
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || "Logout failed";
      errorToast.show(errorMessage);
      // Clear auth even if API call fails and redirect
      clearAuth();
      router.push("/login");
    },
  });
};
