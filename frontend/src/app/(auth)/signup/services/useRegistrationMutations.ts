/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { registrationAPI } from "./registration-api";
import { useAuthToast, useErrorToast, useToast } from "@/lib/hooks/useToast";

export const useParentRegistration = () => {
  const queryClient = useQueryClient();
  const authToast = useAuthToast();
  const errorToast = useErrorToast();

  return useMutation({
    mutationFn: registrationAPI.registerParent,
    onSuccess: (response: any) => {
      queryClient.invalidateQueries({ queryKey: ["auth"] });
      authToast.registrationSuccess("Parent");
      const preAuthToken = response?.data?.preAuthToken || response?.data?.data?.preAuthToken || response?.preAuthToken;
      if (preAuthToken) {
        sessionStorage.setItem("preAuthToken", preAuthToken);
      }
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message || "Registration failed";
      errorToast.show(errorMessage);
      console.error("Parent registration failed:", error);
      throw error;
    },
  });
};

export const useTeacherRegistration = () => {
  const queryClient = useQueryClient();
  const authToast = useAuthToast();
  const errorToast = useErrorToast();

  return useMutation({
    mutationFn: registrationAPI.registerTeacher,
    onSuccess: (response: any) => {
      queryClient.invalidateQueries({ queryKey: ["auth"] });
      authToast.registrationSuccess("Teacher");
      const preAuthToken = response?.data?.preAuthToken || response?.data?.data?.preAuthToken || response?.preAuthToken;
      if (preAuthToken) {
        sessionStorage.setItem("preAuthToken", preAuthToken);
      }
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message || "Registration failed";
      errorToast.show(errorMessage);
      console.error("Teacher registration failed:", error);
      throw error;
    },
  });
};

export const useStudentRegistration = () => {
  const queryClient = useQueryClient();
  const authToast = useAuthToast();
  const errorToast = useErrorToast();

  return useMutation({
    mutationFn: registrationAPI.registerStudent,
    onSuccess: (response: any) => {
      queryClient.invalidateQueries({ queryKey: ["auth"] });
      authToast.registrationSuccess("Student");
      const preAuthToken = response?.data?.preAuthToken || response?.data?.data?.preAuthToken || response?.preAuthToken;
      if (preAuthToken) {
        sessionStorage.setItem("preAuthToken", preAuthToken);
      }
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message || "Registration failed";
      errorToast.show(errorMessage);
      console.error("Student registration failed:", error);
      throw error;
    },
  });
};

export const useSchoolRegistration = () => {
  const queryClient = useQueryClient();
  const authToast = useAuthToast();
  const errorToast = useErrorToast();

  return useMutation({
    mutationFn: registrationAPI.registerSchool,
    onSuccess: (response: any) => {
      queryClient.invalidateQueries({ queryKey: ["auth"] });
      authToast.registrationSuccess("School");
      const preAuthToken = response?.data?.preAuthToken || response?.data?.data?.preAuthToken || response?.preAuthToken;
      if (preAuthToken) {
        sessionStorage.setItem("preAuthToken", preAuthToken);
      }
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message || "Registration failed";
      errorToast.show(errorMessage);
      console.error("School registration failed:", error);
      throw error;
    },
  });
};
