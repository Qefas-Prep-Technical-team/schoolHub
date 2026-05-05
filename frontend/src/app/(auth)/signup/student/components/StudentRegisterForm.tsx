/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { UserRole } from '@/lib/types/user.types';
import { useRouter, useSearchParams } from 'next/navigation';
import { useStudentRegistration } from '../../services/useRegistrationMutations';
import { StudentFormData, studentSchema } from '../../services/regSchema';
import { getPasswordStrength } from '../../school/components/SchoolCard';
import { useMemo } from 'react';
import GoogleLoginButton from '../../../login/components/GoogleLoginButton';
import RedirectOverlay from '@/components/ui/RedirectOverlay';
import { useGlobalFeatures } from "@/lib/api/hooks/useGlobalFeatures";


export default function StudentRegisterForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ strength: 0, message: '' });
  const [showOptional, setShowOptional] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const { mutate: registerStudent, isPending } = useStudentRegistration();
  const { data: globalFeatures } = useGlobalFeatures('student');
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue
  } = useForm<StudentFormData>({
    resolver: yupResolver(studentSchema) as any,
    mode: 'onBlur',
    defaultValues: useMemo(() => ({
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      schoolCode: searchParams.get('schoolCode') || '',
      teacherCode: searchParams.get('teacherCode') || '',
      parentCode: searchParams.get('parentCode') || '',
      classCode: searchParams.get('classCode') || ''
    }), [searchParams])
  });

  // Sync with search params if they change
  useEffect(() => {
    if (searchParams.get('schoolCode')) setValue('schoolCode', searchParams.get('schoolCode') || '');
    if (searchParams.get('teacherCode')) setValue('teacherCode', searchParams.get('teacherCode') || '');
    if (searchParams.get('parentCode')) setValue('parentCode', searchParams.get('parentCode') || '');
    if (searchParams.get('classCode')) setValue('classCode', searchParams.get('classCode') || '');
  }, [searchParams, setValue]);

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

  const onSubmit = async (data: StudentFormData) => {


    try {
      // Transform data to match your backend expectations
      const backendData = {
        fullName: data.fullName.trim(),
        email: data.email.toLowerCase().trim(),
        password: data.password,
        confirmPassword: data.confirmPassword,
        ...(data.schoolCode && { schoolCode: data.schoolCode.trim() }),
        ...(data.teacherCode && { teacherCode: data.teacherCode.trim() }),
        ...(data.parentCode && { parentCode: data.parentCode.trim() }),
        ...(data.classCode && { classCode: data.classCode.trim() })
      };

      await registerStudent(backendData, {
        onSuccess: (response: any) => {
          console.log('✅ Student registration successful:', response.data);


          const email = response.data.data?.student?.email || data.email;

          setShowOverlay(true);
          reset();

          setTimeout(() => {
            router.push(
              `/verification?email=${encodeURIComponent(email)}&userType=${UserRole.STUDENT}&requestCode=true`,
            );
          }, 2000);
        },
        onError: (error: any) => {
          console.error('❌ Student registration failed:', error);
          // Toast is handled in useStudentRegistration
        }
      });

    } catch (error) {
      console.error('❌ Unexpected error:', error);
    }
  };

  return (
    <>
      <RedirectOverlay isVisible={showOverlay} />
      <div className="flex-1 flex flex-col justify-center p-6 sm:p-10 lg:p-12 xl:p-16">
      <div className="max-w-md mx-auto w-full">
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-black text-gray-900 dark:text-white">
            Join Qefas Hub as a Student
          </h1>
          <p className="mt-2 text-base text-gray-600 dark:text-gray-400">
            Access your lessons, assignments, and teachers all in one place.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">


          {/* Full Name */}
          <label className="flex flex-col">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium pb-2 text-gray-700 dark:text-gray-300">
                Full Name *
              </p>
            </div>
            <input
              type="text"
              {...register('fullName')}
              placeholder="Enter your full name"
              className={`form-input w-full rounded-lg border bg-background-light dark:bg-background-dark h-12 px-4 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 ${errors.fullName
                ? 'border-red-500 dark:border-red-400'
                : 'border-gray-300 dark:border-gray-700'
                }`}
              disabled={isPending}
            />
            {errors.fullName && (
              <p className="text-red-500 text-sm mt-2">{errors.fullName.message}</p>
            )}
          </label>

          {/* Email */}
          <label className="flex flex-col">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium pb-2 text-gray-700 dark:text-gray-300">
                Email *
              </p>
            </div>
            <input
              type="email"
              {...register('email')}
              placeholder="Enter your email"
              className={`form-input w-full rounded-lg border bg-background-light dark:bg-background-dark h-12 px-4 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 ${errors.email
                ? 'border-red-500 dark:border-red-400'
                : 'border-gray-300 dark:border-gray-700'
                }`}
              disabled={isPending}
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-2">{errors.email.message}</p>
            )}
          </label>

          {/* Password */}
          <label className="flex flex-col">
            <p className="text-sm font-medium pb-2 text-gray-700 dark:text-gray-300">
              Password *
            </p>
            <div className="relative w-full">
              <input
                type={showPassword ? "text" : "password"}
                {...register('password')}
                placeholder="Enter your password (must contain letters and numbers)"
                className={`form-input w-full rounded-lg border bg-background-light dark:bg-background-dark h-12 px-4 pr-12 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 ${errors.password
                  ? 'border-red-500 dark:border-red-400'
                  : 'border-gray-300 dark:border-gray-700'
                  }`}
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
            <p className="text-sm font-medium pb-2 text-gray-700 dark:text-gray-300">
              Confirm Password *
            </p>
            <div className="relative w-full">
              <input
                type={showConfirmPassword ? "text" : "password"}
                {...register('confirmPassword')}
                placeholder="Confirm your password"
                className={`form-input w-full rounded-lg border bg-background-light dark:bg-background-dark h-12 px-4 pr-12 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 ${errors.confirmPassword
                  ? 'border-red-500 dark:border-red-400'
                  : 'border-gray-300 dark:border-gray-700'
                  }`}
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

          {/* Optional Fields Toggle */}
          <div className="pt-4 pb-2">
            <div className="relative flex items-center justify-center">
              <div className="flex-grow border-t border-gray-100 dark:border-gray-800"></div>
              <button
                type="button"
                onClick={() => setShowOptional(!showOptional)}
                className="flex items-center gap-2 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-gray-400 hover:text-primary transition-all duration-300 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-full shadow-sm hover:shadow-md z-10"
              >
                {showOptional ? 'Hide Referral Codes' : 'Have a Referral Code?'}
                <motion.div
                  animate={{ rotate: showOptional ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ChevronDown size={14} />
                </motion.div>
              </button>
              <div className="flex-grow border-t border-gray-100 dark:border-gray-800"></div>
            </div>
          </div>

          <AnimatePresence>
            {showOptional && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                className="overflow-hidden space-y-6 pt-2"
              >
                {/* School Code */}
                <label className="flex flex-col">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium pb-2 text-gray-700 dark:text-gray-300">
                      School Code (optional)
                    </p>
                    <div className="relative group">
                      <span className="material-symbols-outlined text-gray-400 text-base cursor-pointer">
                        info
                      </span>
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-gray-800 text-white text-xs rounded py-1 px-2 text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                        Enter the code provided by your school.
                      </div>
                    </div>
                  </div>
                  <input
                    type="text"
                    {...register('schoolCode')}
                    placeholder="Enter your School Code"
                    className={`form-input w-full rounded-lg border bg-background-light dark:bg-background-dark h-12 px-4 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 ${errors.schoolCode
                      ? 'border-red-500 dark:border-red-400'
                      : 'border-gray-300 dark:border-gray-700'
                      }`}
                    disabled={isPending}
                  />
                  {errors.schoolCode && (
                    <p className="text-red-500 text-sm mt-2">{errors.schoolCode.message}</p>
                  )}
                </label>

                {/* Teacher Code */}
                <label className="flex flex-col">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium pb-2 text-gray-700 dark:text-gray-300">
                      Teacher Code (optional)
                    </p>
                    <div className="relative group">
                      <span className="material-symbols-outlined text-gray-400 text-base cursor-pointer">
                        info
                      </span>
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-gray-800 text-white text-xs rounded py-1 px-2 text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                        Enter the code provided by your teacher to join their section.
                      </div>
                    </div>
                  </div>
                  <input
                    type="text"
                    {...register('teacherCode')}
                    placeholder="Enter your Teacher Code (format: tch-123456)"
                    className={`form-input w-full rounded-lg border bg-background-light dark:bg-background-dark h-12 px-4 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 ${errors.teacherCode
                      ? 'border-red-500 dark:border-red-400'
                      : 'border-gray-300 dark:border-gray-700'
                      }`}
                    disabled={isPending}
                  />
                  {errors.teacherCode && (
                    <p className="text-red-500 text-sm mt-2">{errors.teacherCode.message}</p>
                  )}
                </label>

                {/* Parent Code */}
                <label className="flex flex-col">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium pb-2 text-gray-700 dark:text-gray-300">
                      Parent Code (optional)
                    </p>
                    <div className="relative group">
                      <span className="material-symbols-outlined text-gray-400 text-base cursor-pointer">
                        info
                      </span>
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-gray-800 text-white text-xs rounded py-1 px-2 text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                        Enter the code provided by your parent to link your accounts.
                      </div>
                    </div>
                  </div>
                  <input
                    type="text"
                    {...register('parentCode')}
                    placeholder="Enter your Parent Code"
                    className={`form-input w-full rounded-lg border bg-background-light dark:bg-background-dark h-12 px-4 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 ${errors.parentCode
                      ? 'border-red-500 dark:border-red-400'
                      : 'border-gray-300 dark:border-gray-700'
                      }`}
                    disabled={isPending}
                  />
                  {errors.parentCode && (
                    <p className="text-red-500 text-sm mt-2">{errors.parentCode.message}</p>
                  )}
                </label>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isPending}
            className="w-full cursor-pointer bg-primary hover:bg-primary/90 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Creating Account...
              </div>
            ) : (
              'Create Student Account'
            )}
          </button>

          {globalFeatures?.googleLogin !== false && (
            <>
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-100 dark:border-gray-800" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white dark:bg-gray-900 px-4 text-gray-400 font-bold tracking-widest">
                    Or continue with
                  </span>
                </div>
              </div>

              <GoogleLoginButton userType={UserRole.STUDENT} />
            </>
          )}
        </form>

        <p className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
          Already have an account?{" "}
          <a
            href="/login"
            className="font-medium text-primary hover:text-primary/80 hover:underline"
            onClick={(e) => {
              if (isPending) e.preventDefault();
            }}
          >
            Log in
          </a>
        </p>
      </div>
      </div>
    </>
  );
}
