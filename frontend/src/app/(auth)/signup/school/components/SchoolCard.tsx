/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import SchoolImageSlider from "./SchoolSlider";

import { useRouter } from 'next/navigation';
import { useSchoolRegistration } from '../../services/useRegistrationMutations';
import { SchoolFormData, schoolSchema } from '../../services/regSchema';
import { UserRole } from '@/lib/types/user.types';

// Password strength checker (same as others)
const getPasswordStrength = (password: string) => {
  if (!password) return { strength: 0, message: '' };

  let strength = 0;
  const messages = [];

  if (password.length >= 6) strength += 1;
  if (/[a-zA-Z]/.test(password)) strength += 1;
  if (/\d/.test(password)) strength += 1;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength += 1;

  let message = '';
  if (strength === 0) message = '';
  else if (strength === 1) message = 'Very weak';
  else if (strength === 2) message = 'Weak';
  else if (strength === 3) message = 'Good';
  else message = 'Strong';

  return { strength, message };
};

export default function SchoolCard() {
  const [serverError, setServerError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [passwordStrength, setPasswordStrength] = useState({ strength: 0, message: '' });
  const router = useRouter();

  const { mutate: registerSchool, isPending } = useSchoolRegistration();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue
  } = useForm<SchoolFormData>({
    resolver: yupResolver(schoolSchema) as any,
    mode: 'onBlur',
    defaultValues: {
      schoolName: '',
      adminName: '',
      email: '',
      password: '',
      confirmPassword: '',
      subdomain: ''
    }
  });

  // Watch password changes for strength indicator
  const passwordValue = watch('password');
  const schoolNameValue = watch('schoolName');

  useEffect(() => {
    setPasswordStrength(getPasswordStrength(passwordValue || ''));
  }, [passwordValue]);

  // Generate subdomain suggestion from school name
  useEffect(() => {
    if (schoolNameValue && !watch('subdomain')) {
      const suggestedSubdomain = schoolNameValue
        .toLowerCase()
        .replace(/[^a-zA-Z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
        .substring(0, 63);

      // Only set if it's a valid subdomain and user hasn't manually entered one
      if (suggestedSubdomain.length >= 3) {
        setValue('subdomain', suggestedSubdomain);
      }
    }
  }, [schoolNameValue, setValue, watch]);

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

  const onSubmit = async (data: SchoolFormData) => {
    setServerError('');
    setSuccessMessage('');

    try {
      // Transform data to match your backend expectations
      const backendData = {
        schoolName: data.schoolName.trim(),
        adminName: data.adminName.trim(),
        email: data.email.toLowerCase().trim(),
        password: data.password,
        confirmPassword: data.confirmPassword,
        ...(data.subdomain && { subdomain: data.subdomain.trim() })
      };

      await registerSchool(backendData, {
        onSuccess: (response: any) => {
          console.log('✅ School registration successful:', response.data);

          const backendMessage = response.data.message || 'Registration successful!';
          setSuccessMessage(backendMessage);

          reset();

          const email = response.data.data?.school?.email || data.email;

          router.push(`/verification?email=${encodeURIComponent(email)}&userType=${UserRole.ADMIN}`);
        },
        onError: (error: any) => {
          console.error('❌ School registration failed:', error);

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
    <div className="flex flex-col md:flex-row gap-10 items-start justify-between">
      {/* Left Form */}
      <div className="flex flex-col gap-4 flex-1">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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

          {/* School Name */}
          <label className="flex flex-col gap-2">
            <p className="text-base font-medium text-gray-800 dark:text-gray-200">School Name *</p>
            <input
              {...register('schoolName')}
              className={`form-input flex w-full rounded-lg text-gray-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border bg-white dark:bg-gray-800 h-12 px-4 ${errors.schoolName
                ? 'border-red-500 dark:border-red-400'
                : 'border-gray-300 dark:border-gray-600'
                }`}
              placeholder="Enter your school name"
              disabled={isPending}
            />
            {errors.schoolName && (
              <p className="text-red-500 text-sm mt-2">{errors.schoolName.message}</p>
            )}
          </label>

          <p className="text-gray-500 dark:text-gray-400 text-sm font-normal pt-0 -mt-2">
            Your school&apos;s web address will be: {schoolNameValue ? `${watch('subdomain') || 'your-school'}.schoolhub.com` : '[schoolname].schoolhub.com'}
          </p>

          {/* Admin Name */}
          <label className="flex flex-col gap-2">
            <p className="text-base font-medium text-gray-800 dark:text-gray-200">Admin Name *</p>
            <input
              {...register('adminName')}
              className={`form-input flex w-full rounded-lg text-gray-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border bg-white dark:bg-gray-800 h-12 px-4 ${errors.adminName
                ? 'border-red-500 dark:border-red-400'
                : 'border-gray-300 dark:border-gray-600'
                }`}
              placeholder="Enter your name"
              disabled={isPending}
            />
            {errors.adminName && (
              <p className="text-red-500 text-sm mt-2">{errors.adminName.message}</p>
            )}
          </label>

          {/* Email Address */}
          <label className="flex flex-col gap-2">
            <p className="text-base font-medium text-gray-800 dark:text-gray-200">Email Address *</p>
            <input
              type="email"
              {...register('email')}
              className={`form-input flex w-full rounded-lg text-gray-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border bg-white dark:bg-gray-800 h-12 px-4 ${errors.email
                ? 'border-red-500 dark:border-red-400'
                : 'border-gray-300 dark:border-gray-600'
                }`}
              placeholder="Enter your email address"
              disabled={isPending}
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-2">{errors.email.message}</p>
            )}
          </label>

          {/* Password */}
          <label className="flex flex-col gap-2">
            <p className="text-base font-medium text-gray-800 dark:text-gray-200">Password *</p>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                {...register('password')}
                className={`form-input flex w-full rounded-lg text-gray-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border bg-white dark:bg-gray-800 h-12 px-4 pr-12 ${errors.password
                  ? 'border-red-500 dark:border-red-400'
                  : 'border-gray-300 dark:border-gray-600'
                  }`}
                placeholder="Create a password (must contain letters and numbers)"
                disabled={isPending}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
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
                  <span className="text-gray-500 dark:text-gray-400">Password strength:</span>
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
                At least 6 characters
              </p>
              <p className="flex items-center">
                <span className="material-symbols-outlined text-xs mr-1">check</span>
                Contains both letters and numbers
              </p>
            </div>
          </label>

          {/* Confirm Password */}
          <label className="flex flex-col gap-2">
            <p className="text-base font-medium text-gray-800 dark:text-gray-200">Confirm Password *</p>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                {...register('confirmPassword')}
                className={`form-input flex w-full rounded-lg text-gray-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border bg-white dark:bg-gray-800 h-12 px-4 pr-12 ${errors.confirmPassword
                  ? 'border-red-500 dark:border-red-400'
                  : 'border-gray-300 dark:border-gray-600'
                  }`}
                placeholder="Confirm your password"
                disabled={isPending}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
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

          {/* Custom Subdomain */}
          <label className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <p className="text-base font-medium text-gray-800 dark:text-gray-200">Custom Subdomain</p>
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded-full">
                Optional
              </span>
            </div>
            <div className="flex items-center">
              <input
                {...register('subdomain')}
                className={`form-input flex-1 w-full rounded-l-lg text-gray-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border bg-white dark:bg-gray-800 h-12 px-4 ${errors.subdomain
                  ? 'border-red-500 dark:border-red-400'
                  : 'border-gray-300 dark:border-gray-600'
                  }`}
                placeholder="your-school"
                disabled={isPending}
              />
              <span className="inline-flex items-center px-4 h-12 rounded-r-lg border border-l-0 border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-sm">
                .schoolhub.com
              </span>
            </div>
            {errors.subdomain && (
              <p className="text-red-500 text-sm mt-2">{errors.subdomain.message}</p>
            )}
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Letters, numbers, and hyphens only. 3-63 characters.
            </p>
          </label>

          {/* Submit Button */}
          <div className="flex flex-col gap-4 pt-4">
            <button
              type="submit"
              disabled={isPending}
              className="flex items-center justify-center w-full bg-primary text-white font-bold h-14 px-6 rounded-lg text-lg hover:bg-primary/90 focus:outline-none focus:ring-4 focus:ring-primary/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Creating School Account...
                </div>
              ) : (
                'Create School Account'
              )}
            </button>
            <p className="text-center text-sm text-gray-600 dark:text-gray-400">
              Already have a school account?{' '}
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
          </div>
        </form>
      </div>

      {/* Right Image */}
      <div className="hidden md:flex items-center justify-center flex-1">
        <SchoolImageSlider />
      </div>
    </div>
  );
}