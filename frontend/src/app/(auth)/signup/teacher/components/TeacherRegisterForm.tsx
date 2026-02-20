/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { UserRole } from '@/lib/types/user.types';
import { useRouter } from 'next/navigation';
import { useTeacherRegistration } from '../../services/useRegistrationMutations';
import { TeacherFormData, teacherSchema } from '../../services/regSchema';
import { getPasswordStrength } from '../../school/components/SchoolCard';


export default function TeacherRegisterForm() {
  const [serverError, setServerError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [passwordStrength, setPasswordStrength] = useState({ strength: 0, message: '' });
  const router = useRouter();

  const { mutate: registerTeacher, isPending } = useTeacherRegistration();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
    getValues
  } = useForm<TeacherFormData>({
    resolver: yupResolver(teacherSchema) as any,
    mode: 'onBlur',
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      tenantId: '',
      isIndependent: false
    }
  });

  // Watch password changes for strength indicator
  const passwordValue = watch('password');
  const isIndependentValue = watch('isIndependent');

  useEffect(() => {
    setPasswordStrength(getPasswordStrength(passwordValue || ''));
  }, [passwordValue]);

  // Clear tenantId when independent account is selected
  useEffect(() => {
    if (isIndependentValue) {
      setValue('tenantId', '');
    }
  }, [isIndependentValue, setValue]);

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

  const onSubmit = async (data: TeacherFormData) => {
    setServerError('');
    setSuccessMessage('');

    try {
      // Transform data to match your backend expectations
      const backendData = {
        fullName: data.fullName.trim(),
        email: data.email.toLowerCase().trim(),
        password: data.password,
        confirmPassword: data.confirmPassword,
        isIndependent: data.isIndependent,
        ...(data.tenantId && !data.isIndependent && { tenantId: data.tenantId.trim() })
      };

      await registerTeacher(backendData, {
        onSuccess: (response: any) => {
          console.log('✅ Teacher registration successful:', response.data);

          const backendMessage = response.data.message || 'Registration successful!';
          setSuccessMessage(backendMessage);

          reset();

          const email = response.data.data?.teacher?.email || data.email;

          setTimeout(() => {
            router.push(`/verification?email=${encodeURIComponent(email)}&userType=${UserRole.TEACHER}`);

          }, 2000);
        },
        onError: (error: any) => {
          console.error('❌ Teacher registration failed:', error);

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
          Join SchoolHub as a Teacher
        </h1>
        <p className="text-lg font-normal leading-normal text-[#4c809a] dark:text-gray-400">
          Empower your students and manage your classroom efficiently.
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
            placeholder="Enter your email address"
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

          <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 space-y-1">
            <p className="flex items-center">
              <span className="material-symbols-outlined text-xs mr-1">check</span>
              At least 8 characters
            </p>
            <p className="flex items-center">
              <span className="material-symbols-outlined text-xs mr-1">check</span>
              One uppercase + one lowercase letter
            </p>
            <p className="flex items-center">
              <span className="material-symbols-outlined text-xs mr-1">check</span>
              One number + one special character
            </p>
            <p className="flex items-center">
              <span className="material-symbols-outlined text-xs mr-1">check</span>
              No spaces
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

        {/* Divider */}
        <div className="relative flex items-center py-4">
          <div className="flex-grow border-t border-input-border-light dark:border-input-border-dark"></div>
          <span className="flex-shrink mx-4 text-sm text-[#4c809a] dark:text-gray-400">Optional</span>
          <div className="flex-grow border-t border-input-border-light dark:border-input-border-dark"></div>
        </div>

        {/* Tenant ID */}
        <label className="flex flex-col">
          <div className="flex items-center justify-between pb-2">
            <p className="text-base font-medium text-[#0d171b] dark:text-gray-300">Tenant ID</p>
            <div className="relative group">
              <span className="material-symbols-outlined text-[#4c809a] dark:text-gray-400 cursor-pointer text-base">
                help_outline
              </span>
              <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 w-48 bg-slate-800 text-white text-xs rounded-lg p-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                This ID connects you to your school&apos;s portal. Ask your administrator for it.
              </div>
            </div>
          </div>
          <input
            type="text"
            {...register('tenantId')}
            placeholder="Enter your school's Tenant ID"
            className={`form-input h-14 rounded-lg border bg-background-light dark:bg-background-dark p-4 text-base font-normal text-[#0d171b] dark:text-white placeholder:text-[#4c809a] focus:outline-none focus:ring-2 focus:ring-primary/50 ${errors.tenantId
              ? 'border-red-500 dark:border-red-400'
              : 'border-input-border-light dark:border-input-border-dark'
              }`}
            disabled={isPending || isIndependentValue}
          />
          {errors.tenantId && (
            <p className="text-red-500 text-sm mt-2">{errors.tenantId.message}</p>
          )}
        </label>

        {/* Independent Teacher Checkbox */}
        <div className="flex items-center">
          <input
            id="independent-teacher-checkbox"
            type="checkbox"
            {...register('isIndependent')}
            className="h-4 w-4 rounded border-input-border-light dark:border-input-border-dark 
            bg-background-light dark:bg-background-dark text-primary focus:ring-primary/50"
            disabled={isPending}
          />
          <label
            htmlFor="independent-teacher-checkbox"
            className="ml-2 block text-sm text-[#0d171b] dark:text-gray-300"
          >
            I want to create an independent teaching account
          </label>
        </div>

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
            'Sign Up as Teacher'
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