/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useAuthStore, UserType } from "./auth-store";
import { useAuthToast, useErrorToast, useToast } from "@/lib/hooks/useToast";
import { authAPI } from "./auth-api";

export const useLoginMutation = () => {
  const queryClient = useQueryClient();
  const authToast = useAuthToast();
  const errorToast = useErrorToast();
  const { info } = useToast();
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const setHasCompletedOnboarding = useAuthStore((state) => state.setHasCompletedOnboarding);

  return useMutation({
    mutationFn: (credentials: {
      email: string;
      password?: string;
      userType: UserType; // Use UserType instead of string
      isNewUser?: boolean;
      preAuthToken?: string;
    }) => {
      const { isNewUser, ...rest } = credentials;
      return authAPI.login(rest);
    },
    // useLoginMutation logic
    onSuccess: (response: any, variables) => {
      // Clear previous session data from storage and cache
      localStorage.clear();
      queryClient.clear();
      

      const userWithType = {
        ...response.data.user,
        // Ensure 'name' is populated. Fallback to 'fullName' if that's what backend sends
        name: response.data.user.name || response.data.user.fullName || "User",
        userType: variables.userType,
      };

      setAuth(userWithType, response.data.accessToken);
      // Check if they came from verification with new=true or via variables
      const isNewUser = variables.isNewUser ?? (typeof window !== 'undefined' 
        ? new URLSearchParams(window.location.search).get("new") === "true" 
        : false);
        
      authToast.loginSuccess(userWithType.name);

      const actualRole = response.data.userRole || variables.userType;
      const userDash = actualRole.toLowerCase().replace('_', '-');

      const isAdminWithoutPlan = actualRole === 'ADMIN' && !response.data.user.plan;

      if (isNewUser || isAdminWithoutPlan) {
        setHasCompletedOnboarding(false);
        if (actualRole === 'ADMIN') {
          router.replace(`/select-plan`);
        } else {
          router.replace(`/onboarding?type=${variables.userType}`);
        }
      } else {
        setHasCompletedOnboarding(true); // Skip onboarding for returning users
        router.replace(`/dashboard/${userDash}`);
      }
    },
    onError: (error: any, variables) => {
      const errorMessage = error.response?.data?.message || "Login failed";

      // Redirect unverified users to verification page
      if (
        error.response?.status === 403 &&
        (errorMessage.toLowerCase().includes("verified") ||
          errorMessage.toLowerCase().includes("verification"))
      ) {
        info("Redirection to verification page for account verification.");
        
        const preAuthToken = error.response?.data?.preAuthToken;
        if (preAuthToken) {
           sessionStorage.setItem("preAuthToken", preAuthToken);
        }
        
        router.push(
          `/verification?email=${encodeURIComponent(variables.email)}&userType=${variables.userType}&requestCode=true`,
        );
        return;
      }

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
