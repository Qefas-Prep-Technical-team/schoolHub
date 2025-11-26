/* eslint-disable @typescript-eslint/no-explicit-any */
// lib/auth/forgot-password/mutations.ts
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useAuthToast, useErrorToast } from "@/lib/hooks/useToast";
import { forgotPasswordAPI } from "./api";

export const useRequestPasswordResetMutation = () => {
  const authToast = useAuthToast();
  const errorToast = useErrorToast();

  return useMutation({
    mutationFn: forgotPasswordAPI.requestPasswordReset,
    onSuccess: (response) => {
      // Use the message directly from backend as per your API response
      authToast.success(response.message);
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || "Failed to send reset instructions";
      
      // Show specific message for unverified accounts
      if (error.response?.data?.message?.includes('verify your email')) {
        errorToast.show(errorMessage);
      } else {
        errorToast.show(errorMessage);
      }
      
      console.error("Password reset request failed:", error);
      throw error;
    },
  });
};

export const useResetPasswordMutation = () => {
  const authToast = useAuthToast();
  const errorToast = useErrorToast();
  const router = useRouter();

  return useMutation({
    mutationFn: ({ token, newPassword,confirmPassword }: { token: string; newPassword: string ,confirmPassword:string  }) =>
      forgotPasswordAPI.resetPassword(token, newPassword,confirmPassword),
    onSuccess: (response) => {
      authToast.success(response.message || "Password reset successfully");
      
      // Redirect to login after successful password reset
      setTimeout(() => {
        router.push("/forgotPassword/PasswordResetSuccessful");
      }, 2000);
     
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || "Failed to reset password";
      errorToast.show(errorMessage);
      console.error("Password reset failed:", error);
      throw error;
    },
  });
};

// lib/auth/forgot-password/mutations.ts
export const useValidateResetTokenMutation = () => {
  return useMutation({
    mutationFn: forgotPasswordAPI.validateResetToken,
    onError: (error: any) => {
      console.error("Token validation failed:", error);
      throw error;
    },
  });
};

export const useResendResetEmailMutation = () => {
  const authToast = useAuthToast();
  const errorToast = useErrorToast();

  return useMutation({
    mutationFn: forgotPasswordAPI.resendResetEmail,
    onSuccess: (response) => {
      authToast.success(response.message || "Reset email sent successfully");
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || "Failed to resend reset email";
      errorToast.show(errorMessage);
      console.error("Resend reset email failed:", error);
      throw error;
    },
  });
};