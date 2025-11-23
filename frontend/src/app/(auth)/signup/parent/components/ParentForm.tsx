/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { UserRole } from '@/lib/types/user.types';
import { ParentFormData, parentSchema } from '../../services/regSchema';
import { useParentRegistration } from '../../services/useRegistrationMutations';
import { useRouter } from 'next/navigation';

// Password strength checker
const getPasswordStrength = (password: string) => {
  if (!password) return { strength: 0, message: '' };

  let strength = 0;
  const messages = [];

  // Length check
  if (password.length >= 6) strength += 1;

  // Has letters check
  if (/[a-zA-Z]/.test(password)) strength += 1;

  // Has numbers check
  if (/\d/.test(password)) strength += 1;

  // Has special characters (optional)
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength += 1;

  // Generate message based on strength
  let message = '';
  if (strength === 0) message = '';
  else if (strength === 1) message = 'Very weak';
  else if (strength === 2) message = 'Weak';
  else if (strength === 3) message = 'Good';
  else message = 'Strong';

  return { strength, message };
};

export default function ParentRegistrationForm() {
  const [serverError, setServerError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [passwordStrength, setPasswordStrength] = useState({ strength: 0, message: '' });
  const router = useRouter();

  const { mutate: registerParent, isPending } = useParentRegistration();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch
  } = useForm<ParentFormData>({
    resolver: yupResolver(parentSchema) as any,
    mode: 'onBlur',
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      studentCode: ''
    }
  });

  // Watch password changes for strength indicator
  const passwordValue = watch('password');

  useEffect(() => {
    setPasswordStrength(getPasswordStrength(passwordValue || ''));
  }, [passwordValue]);

  const getStrengthColor = (strength: number) => {
    if (strength === 0) return 'bg-gray-200';
    if (strength === 1) return 'bg-red-500';
    if (strength === 2) return 'bg-orange-500';
    if (strength === 3) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStrengthTextColor = (strength: number) => {
    if (strength === 0) return 'text-gray-500';
    if (strength === 1) return 'text-red-500';
    if (strength === 2) return 'text-orange-500';
    if (strength === 3) return 'text-yellow-500';
    return 'text-green-500';
  };

  const onSubmit = async (data: ParentFormData) => {
    setServerError('');
    setSuccessMessage('');

    try {
      // Transform data to match your backend expectations
      const backendData = {
        fullName: data.fullName.trim(),
        email: data.email.toLowerCase().trim(),
        password: data.password,
        confirmPassword: data.confirmPassword,
        ...(data.studentCode && { studentCode: data.studentCode.trim() })
      };

      await registerParent(backendData, {
        onSuccess: (response: any) => {
          console.log('✅ Parent registration successful:', response.data);

          // Show success message from backend
          const backendMessage = response.data.message || 'Registration successful!';
          setSuccessMessage(backendMessage);

          // Reset form
          reset();

          // Redirect to login after delay
          const email = response.data.data.parent.email

          setTimeout(() => {
            router.push(`/verification?email=${encodeURIComponent(email)}&userType=${UserRole.ADMIN}`);

          }, 2000);
        },
        onError: (error: any) => {
          console.error('❌ Parent registration failed:', error);

          // Handle different error types from your backend
          const errorMessage = error.response?.data?.message ||
            error.message ||
            'Registration failed. Please try again.';
          setServerError(errorMessage);
        }
      });

    } catch (error) {
      console.error('❌ Unexpected error:', error);
      setServerError('An unexpected error occurred. Please try again.');
    }
  };

  return (
    <div className="flex flex-col justify-center">
      <div className="flex flex-col gap-3 p-4">
        <h1 className="text-4xl font-black leading-tight tracking-[-0.033em] text-[#0d171b] dark:text-white">
          Join SchoolHub as a Parent
        </h1>
        <p className="text-lg font-normal leading-normal text-[#4c809a] dark:text-gray-400">
          Stay connected to your child&apos;s progress and school updates.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6 p-4">
        {/* Success Message */}
        {successMessage && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            <div className="flex items-center">
              <span className="material-symbols-outlined mr-2">check_circle</span>
              {successMessage}
            </div>
            <p className="text-sm mt-1">Redirecting to verification...</p>
          </div>
        )}

        {/* Server Error */}
        {serverError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <div className="flex items-center">
              <span className="material-symbols-outlined mr-2">error</span>
              {serverError}
            </div>
          </div>
        )}

        {/* Full Name */}
        <label className="flex flex-col">
          <p className="text-base font-medium pb-2 text-[#0d171b] dark:text-gray-300">Full Name *</p>
          <input
            type="text"
            {...register('fullName')}
            placeholder="Enter your full name"
            className={`form-input h-14 rounded-lg border bg-background-light dark:bg-background-dark p-4 text-base font-normal text-[#0d171b] dark:text-white placeholder:text-[#4c809a] focus:outline-none focus:ring-2 focus:ring-primary/50 ${errors.fullName
              ? 'border-red-500 dark:border-red-400'
              : 'border-input-border-light dark:border-input-border-dark'
              }`}
            disabled={isPending}
          />
          {errors.fullName && (
            <p className="text-red-500 text-sm mt-2">{errors.fullName.message}</p>
          )}
        </label>

        {/* Email */}
        <label className="flex flex-col">
          <p className="text-base font-medium pb-2 text-[#0d171b] dark:text-gray-300">Email *</p>
          <input
            type="email"
            {...register('email')}
            placeholder="Enter your email"
            className={`form-input h-14 rounded-lg border bg-background-light dark:bg-background-dark p-4 text-base font-normal text-[#0d171b] dark:text-white placeholder:text-[#4c809a] focus:outline-none focus:ring-2 focus:ring-primary/50 ${errors.email
              ? 'border-red-500 dark:border-red-400'
              : 'border-input-border-light dark:border-input-border-dark'
              }`}
            disabled={isPending}
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-2">{errors.email.message}</p>
          )}
        </label>

        {/* Password */}
        <label className="flex flex-col">
          <p className="text-base font-medium pb-2 text-[#0d171b] dark:text-gray-300">Password *</p>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              {...register('password')}
              placeholder="Enter your password (must contain letters and numbers)"
              className={`form-input h-14 w-full rounded-lg border bg-background-light dark:bg-background-dark p-4 pr-12 text-base font-normal text-[#0d171b] dark:text-white placeholder:text-[#4c809a] focus:outline-none focus:ring-2 focus:ring-primary/50 ${errors.password
                ? 'border-red-500 dark:border-red-400'
                : 'border-input-border-light dark:border-input-border-dark'
                }`}
              disabled={isPending}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-4 text-[#4c809a] dark:text-gray-400 hover:text-[#0d171b] dark:hover:text-white transition-colors"
              disabled={isPending}
            >
              <span className="material-symbols-outlined text-xl">
                {showPassword ? "visibility_off" : "visibility"}
              </span>
            </button>
          </div>

          {/* Password Strength Indicator */}
          {passwordValue && (
            <div className="mt-3 space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-[#4c809a] dark:text-gray-400">Password strength:</span>
                <span className={`font-medium ${getStrengthTextColor(passwordStrength.strength)}`}>
                  {passwordStrength.message}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${getStrengthColor(passwordStrength.strength)}`}
                  style={{ width: `${(passwordStrength.strength / 4) * 100}%` }}
                ></div>
              </div>
            </div>
          )}

          {errors.password && (
            <p className="text-red-500 text-sm mt-2">{errors.password.message}</p>
          )}

          <div className="text-xs text-[#4c809a] dark:text-gray-500 mt-2 space-y-1">
            <p className="flex items-center">
              <span className="material-symbols-outlined text-xs mr-1">check</span>
              At least 6 characters
            </p>
            <p className="flex items-center">
              <span className="material-symbols-outlined text-xs mr-1">check</span>
              Contains both letters and numbers
            </p>
          </div>
        </label>

        {/* Confirm Password */}
        <label className="flex flex-col">
          <p className="text-base font-medium pb-2 text-[#0d171b] dark:text-gray-300">Confirm Password *</p>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              {...register('confirmPassword')}
              placeholder="Confirm your password"
              className={`form-input h-14 w-full rounded-lg border bg-background-light dark:bg-background-dark p-4 pr-12 text-base font-normal text-[#0d171b] dark:text-white placeholder:text-[#4c809a] focus:outline-none focus:ring-2 focus:ring-primary/50 ${errors.confirmPassword
                ? 'border-red-500 dark:border-red-400'
                : 'border-input-border-light dark:border-input-border-dark'
                }`}
              disabled={isPending}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-4 text-[#4c809a] dark:text-gray-400 hover:text-[#0d171b] dark:hover:text-white transition-colors"
              disabled={isPending}
            >
              <span className="material-symbols-outlined text-xl">
                {showConfirmPassword ? "visibility_off" : "visibility"}
              </span>
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-red-500 text-sm mt-2">{errors.confirmPassword.message}</p>
          )}
        </label>

        {/* Student Code */}
        <label className="flex flex-col">
          <div className="flex items-center justify-between pb-2">
            <p className="text-base font-medium text-[#0d171b] dark:text-gray-300">Student Code</p>
            <span className="text-sm text-[#4c809a] dark:text-gray-400">Optional</span>
          </div>
          <input
            type="text"
            {...register('studentCode')}
            placeholder="Enter student code (format: stu-123456)"
            className={`form-input h-14 rounded-lg border bg-background-light dark:bg-background-dark p-4 text-base font-normal text-[#0d171b] dark:text-white placeholder:text-[#4c809a] focus:outline-none focus:ring-2 focus:ring-primary/50 ${errors.studentCode
              ? 'border-red-500 dark:border-red-400'
              : 'border-input-border-light dark:border-input-border-dark'
              }`}
            disabled={isPending}
          />
          {errors.studentCode && (
            <p className="text-red-500 text-sm mt-2">{errors.studentCode.message}</p>
          )}
          <p className="text-xs text-[#4c809a] dark:text-gray-500 mt-2">
            You can link to your child&apos;s account later from your dashboard.
          </p>
        </label>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isPending}
          className="w-full h-14 rounded-lg bg-primary text-white font-semibold hover:bg-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:focus:ring-offset-background-dark disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Creating Account...
            </div>
          ) : (
            'Create Parent Account'
          )}
        </button>

        <p className="text-center text-sm text-[#4c809a] dark:text-gray-400">
          Already have an account?{" "}
          <a
            className="font-medium text-primary hover:underline"
            href="/login"
            onClick={(e) => {
              if (isPending) e.preventDefault();
            }}
          >
            Log in
          </a>
        </p>
      </form>
    </div>
  );
}