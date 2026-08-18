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
  const setTransitioning = useAuthStore((state) => state.setTransitioning);

  return useMutation({
    mutationFn: (credentials: {
      email: string;
      password?: string;
      userType: UserType;
      isNewUser?: boolean;
      preAuthToken?: string;
    }) => {
      const { isNewUser, ...rest } = credentials;
      return authAPI.login(rest);
    },
    onSuccess: (response: any, variables) => {
      try {
        console.log("DEBUG: Login onSuccess received response:", response);

        // Clear previous session data from storage and cache
        localStorage.clear();
        queryClient.clear();

        if (!response || !response.data) {
          throw new Error("Invalid response format: 'data' property is missing.");
        }

        const userWithType = {
          ...response.data.user,
          name: response.data.user.name || response.data.user.fullName || "User",
          userType: variables.userType,
        };

        setAuth(userWithType, response.data.accessToken);

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
          setHasCompletedOnboarding(true);
          setTransitioning(true, actualRole, userWithType.name);

          setTimeout(() => {
            setTransitioning(false);
            router.replace(`/dashboard/${userDash}`);
          }, 2500);
        }
      } catch (err: any) {
        console.error("CRITICAL: Error in login onSuccess handler:", err);
        errorToast.show(err.message || "Failed to set up login session");
      }
    },
    onError: (error: any, variables) => {
      const errorMessage = error.response?.data?.message || "Login failed";

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

export const useActualLogoutMutation = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const authToast = useAuthToast();
  const errorToast = useErrorToast();

  return useMutation({
    mutationFn: authAPI.logout,
    onSuccess: () => {
      queryClient.clear(); // Clear all cached data (admin, parent, etc)
      clearAuth();
      authToast.logoutSuccess();
      router.push("/login");
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || "Logout failed";
      errorToast.show(errorMessage);
      queryClient.clear();
      clearAuth();
      router.push("/login");
    },
  });
};

export const useLogoutMutation = () => {
  const setLogoutModalOpen = useAuthStore((state) => state.setLogoutModalOpen);

  return {
    mutate: () => setLogoutModalOpen(true),
    mutateAsync: async () => setLogoutModalOpen(true),
    isPending: false,
  };
};
