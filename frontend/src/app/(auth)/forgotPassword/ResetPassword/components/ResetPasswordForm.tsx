/* eslint-disable @typescript-eslint/no-explicit-any */
// components/ResetPasswordForm.tsx
"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import PasswordField from "./PasswordField";
import PasswordStrengthBar from "./PasswordStrengthBar";
import { ResetPasswordFormData, resetPasswordSchema } from "../../services/schemas";
import { useResetPasswordMutation, useValidateResetTokenMutation } from "../../services/mutations";

export default function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  
  const [isValidating, setIsValidating] = useState(true);
  const [validationError, setValidationError] = useState("");
  const [serverError, setServerError] = useState("");
  const [email, setEmail] = useState("");

  const { mutate: validateToken, isPending: isValidatingToken } = useValidateResetTokenMutation();
  const { mutate: resetPassword, isPending: isResettingPassword } = useResetPasswordMutation();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    watch,
    trigger,
  } = useForm<ResetPasswordFormData>({
    resolver: yupResolver(resetPasswordSchema),
    mode: 'onChange',
    defaultValues: {
      password: "",
      confirmPassword: ""
    }
  });

  const passwordValue = watch('password');
  const confirmPasswordValue = watch('confirmPassword');
  const isPending = isResettingPassword;

  // Validate token on component mount
  useEffect(() => {
    if (!token) {
      setValidationError("Invalid reset link. Please request a new password reset.");
      setIsValidating(false);
      return;
    }

    validateToken(token, {
      onSuccess: (response) => {
        if (response.success) {
          setEmail(response.data?.email || "");
          setIsValidating(false);
        } else {
          setValidationError(response.message || "Invalid reset token");
          setIsValidating(false);
        }
      },
      onError: (error: any) => {
        const errorMessage = error.response?.data?.message || "Failed to validate reset token. Please try again.";
        setValidationError(errorMessage);
        setIsValidating(false);
        console.error("Token validation error:", error);
      },
    });
  }, [token, validateToken]);

  const onSubmit = (data: ResetPasswordFormData) => {
    if (!token) return;
    
    setServerError("");
    resetPassword(
      { token, newPassword: data.password ,confirmPassword: data.confirmPassword },
      {
        onError: (error: any) => {
          const errorMessage = error.response?.data?.message || "Failed to reset password";
          setServerError(errorMessage);
        },
      }
    );
  };

  const handlePasswordChange = (value: string) => {
    setValue('password', value, { shouldValidate: true });
    if (serverError) setServerError("");
  };

  const handleConfirmPasswordChange = (value: string) => {
    setValue('confirmPassword', value, { shouldValidate: true });
    if (serverError) setServerError("");
  };

  const handleBlur = (field: 'password' | 'confirmPassword') => async () => {
    await trigger(field);
  };

  // Show loading state while validating
  if (isValidating) {
    return (
      <div className="flex w-full flex-col gap-6">
        <div className="flex flex-col items-center justify-center gap-4 py-8">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 dark:text-gray-400">
            {isValidatingToken ? "Validating reset link..." : "Loading..."}
          </p>
        </div>
      </div>
    );
  }

  // Show error page if validation fails
  if (validationError) {
    return (
      <div className="flex w-full flex-col gap-6">
        <div className="flex flex-col items-center justify-center gap-4 text-center py-8">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
            <span className="text-2xl">⚠️</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Invalid Reset Link
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {validationError}
          </p>
          <div className="flex flex-col gap-3 w-full mt-4">
            <button
              onClick={() => router.push('/forgot-password')}
              className="flex items-center justify-center gap-2 h-12 px-6 text-base font-semibold text-white rounded-lg bg-primary hover:bg-primary/90 focus:ring-2 focus:ring-primary/50 focus:outline-none w-full"
            >
              Request New Reset Link
            </button>
            <a
              href="/login"
              className="text-sm font-semibold text-center text-[#4d6599] dark:text-slate-400 hover:text-primary dark:hover:text-primary"
            >
              Back to Login
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Show the reset form if token is valid
  return (
    <div className="flex w-full flex-col gap-6">
      {email && (
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-sm text-blue-700 dark:text-blue-300 text-center">
            Resetting password for: <strong>{email}</strong>
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="flex flex-col gap-4">
          <div>
            <PasswordField
              label="New Password"
              placeholder="Enter your new password"
              value={passwordValue}
              onChange={handlePasswordChange}
              onBlur={handleBlur('password')}
              error={!!errors.password}
              errorMessage={errors.password?.message}
              disabled={isPending}
            />
            <PasswordStrengthBar password={passwordValue} />
          </div>

          <PasswordField
            label="Confirm Password"
            placeholder="Confirm your new password"
            value={confirmPasswordValue}
            onChange={handleConfirmPasswordChange}
            onBlur={handleBlur('confirmPassword')}
            error={!!errors.confirmPassword}
            errorMessage={errors.confirmPassword?.message}
            disabled={isPending}
          />

          {serverError && (
            <div className="p-3 text-sm text-red-500 bg-red-50 rounded-lg dark:bg-red-900/20 dark:text-red-400 animate-fadeIn">
              {serverError}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4 mt-6">
          <button
            type="submit"
            disabled={isPending || !isValid}
            className="flex items-center justify-center gap-2 h-12 px-6 text-base font-semibold text-white rounded-lg bg-primary hover:bg-primary/90 focus:ring-2 focus:ring-primary/50 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed w-full transition-colors duration-200"
          >
            {isPending ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Resetting Password...
              </>
            ) : (
              "Reset Password"
            )}
          </button>
          <a
            href="/login"
            className="text-sm font-semibold text-center text-[#4d6599] dark:text-slate-400 hover:text-primary dark:hover:text-primary"
          >
            Back to Login
          </a>
        </div>
      </form>
    </div>
  );
}