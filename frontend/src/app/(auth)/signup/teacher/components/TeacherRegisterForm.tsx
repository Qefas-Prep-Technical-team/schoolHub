/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { UserRole } from '@/lib/types/user.types';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTeacherRegistration } from '../../services/useRegistrationMutations';
import { TeacherFormData, teacherSchema } from '../../services/regSchema';
import { getPasswordStrength } from '../../school/components/SchoolCard';
import GoogleLoginButton from '../../../login/components/GoogleLoginButton';
import RedirectOverlay from '@/components/ui/RedirectOverlay';
import { useGlobalFeatures } from "@/lib/api/hooks/useGlobalFeatures";

export default function TeacherRegisterForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ strength: 0, message: '' });
  const [showOverlay, setShowOverlay] = useState(false);
  const [showOptional, setShowOptional] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const { mutate: registerTeacher, isPending } = useTeacherRegistration();
  const { data: globalFeatures } = useGlobalFeatures('teacher');
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
      schoolCode: searchParams.get('schoolCode') || '',
      classCode: searchParams.get('classCode') || '',
      isIndependent: false,
      acceptTerms: false
    }
  });

  // Sync with search params if they change
  useEffect(() => {
    if (searchParams.get('schoolCode')) setValue('schoolCode', searchParams.get('schoolCode') || '');
    if (searchParams.get('studentCode')) setValue('studentCode', searchParams.get('studentCode') || '');
    if (searchParams.get('classCode')) setValue('classCode', searchParams.get('classCode') || '');
  }, [searchParams, setValue]);

  // Watch password changes for strength indicator
  const passwordValue = watch('password');
  const isIndependentValue = watch('isIndependent');

  useEffect(() => {
    setPasswordStrength(getPasswordStrength(passwordValue || ''));
  }, [passwordValue]);

  // Clear schoolCode when independent account is selected
  useEffect(() => {
    if (isIndependentValue) {
      setValue('schoolCode', '');
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


    try {
      // Transform data to match your backend expectations
      const backendData = {
        fullName: data.fullName.trim(),
        email: data.email.toLowerCase().trim(),
        password: data.password,
        confirmPassword: data.confirmPassword,
        isIndependent: data.isIndependent,
        acceptTerms: data.acceptTerms,
        ...(data.schoolCode && !data.isIndependent && { schoolCode: data.schoolCode.trim() }),
        ...(data.studentCode && { studentCode: data.studentCode.trim() }),
        ...(data.classCode && { classCode: data.classCode.trim() })
      };

      await registerTeacher(backendData, {
        onSuccess: (response: any) => {
          console.log('✅ Teacher registration successful:', response.data);


          const email = response.data.data?.teacher?.email || data.email;

          setShowOverlay(true);
          reset();

          setTimeout(() => {
            router.push(
              `/verification?email=${encodeURIComponent(email)}&userType=${UserRole.TEACHER}&requestCode=true`,
            );
          }, 2000);
        },
        onError: (error: any) => {
          console.error('❌ Teacher registration failed:', error);
          // Toast is handled in useTeacherRegistration
        }
      });

    } catch (error) {
      console.error('❌ Unexpected error:', error);
    }
  };

  return (
    <>
      <RedirectOverlay isVisible={showOverlay} />
      <div className="flex flex-col justify-center">
      <div className="flex flex-col gap-3 p-4">
        <h1 className="text-4xl font-black leading-tight tracking-[-0.033em] text-[#0d171b] dark:text-white">
          Join Qefas Hub as a Teacher
        </h1>
        <p className="text-lg font-normal leading-normal text-[#4c809a] dark:text-gray-400">
          Empower your students and manage your classroom efficiently.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6 p-4">


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

        {/* Optional Fields Accordion */}
        <div className="border border-input-border-light dark:border-input-border-dark rounded-lg overflow-hidden transition-all duration-300">
          <button
            type="button"
            onClick={() => setShowOptional(!showOptional)}
            className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800/50 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#4c809a]">settings</span>
              <span className="text-base font-semibold text-[#0d171b] dark:text-gray-300">Optional Information</span>
            </div>
            <span className={`material-symbols-outlined transition-transform duration-300 ${showOptional ? 'rotate-180' : ''}`}>
              expand_more
            </span>
          </button>

          <div className={`transition-all duration-300 ease-in-out ${showOptional ? 'max-h-[1000px] opacity-100 p-4 space-y-6' : 'max-h-0 opacity-0 pointer-events-none'}`}>
            {/* School Code */}
            <label className="flex flex-col">
              <div className="flex items-center justify-between pb-2">
                <p className="text-base font-medium text-[#0d171b] dark:text-gray-300">School Code</p>
                <div className="relative group">
                  <span className="material-symbols-outlined text-[#4c809a] dark:text-gray-400 cursor-pointer text-base">
                    help_outline
                  </span>
                  <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 w-48 bg-slate-800 text-white text-xs rounded-lg p-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 text-center font-normal">
                    This code connects you to your school&apos;s portal. Ask your administrator for it.
                  </div>
                </div>
              </div>
              <input
                type="text"
                {...register('schoolCode')}
                placeholder="Enter your school's Code"
                className={`form-input h-14 rounded-lg border bg-background-light dark:bg-background-dark p-4 text-base font-normal text-[#0d171b] dark:text-white placeholder:text-[#4c809a] focus:outline-none focus:ring-2 focus:ring-primary/50 ${errors.schoolCode
                  ? 'border-red-500 dark:border-red-400'
                  : 'border-input-border-light dark:border-input-border-dark'
                  }`}
                disabled={isPending || isIndependentValue}
              />
              {errors.schoolCode && (
                <p className="text-red-500 text-sm mt-2">{errors.schoolCode.message}</p>
              )}
            </label>

            {/* Student Code */}
            <label className="flex flex-col">
              <div className="flex items-center justify-between pb-2">
                <p className="text-base font-medium text-[#0d171b] dark:text-gray-300">Student Code</p>
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
                Providing a student code will send a connection request to that student.
              </p>
            </label>

            {/* Class Code */}
            <label className="flex flex-col">
              <div className="flex items-center justify-between pb-2">
                <p className="text-base font-medium text-[#0d171b] dark:text-gray-300">Class Code</p>
              </div>
              <input
                type="text"
                {...register('classCode')}
                placeholder="Enter Class code (format: cls-123456)"
                className={`form-input h-14 rounded-lg border bg-background-light dark:bg-background-dark p-4 text-base font-normal text-[#0d171b] dark:text-white placeholder:text-[#4c809a] focus:outline-none focus:ring-2 focus:ring-primary/50 ${errors.classCode
                  ? 'border-red-500 dark:border-red-400'
                  : 'border-input-border-light dark:border-input-border-dark'
                  }`}
                disabled={isPending}
              />
              {errors.classCode && (
                <p className="text-red-500 text-sm mt-2">{errors.classCode.message}</p>
              )}
            </label>
          </div>
        </div>


        {/* Independent Teacher Checkbox */}
        <div className="flex items-center p-2 rounded-lg border border-transparent hover:border-primary/20 hover:bg-primary/5 transition-all duration-300">
          <div className="flex items-center h-5">
            <input
              id="independent-teacher-checkbox"
              type="checkbox"
              {...register('isIndependent')}
              className="h-5 w-5 rounded border-input-border-light dark:border-input-border-dark 
              bg-background-light dark:bg-background-dark text-primary focus:ring-primary/50 transition-all cursor-pointer"
              disabled={isPending}
            />
          </div>
          <label
            htmlFor="independent-teacher-checkbox"
            className="ml-3 block text-sm font-medium text-[#0d171b] dark:text-gray-300 cursor-pointer"
          >
            I want to create an independent teaching account
          </label>
        </div>

        {/* Privacy and Policy Checkbox */}
        <div className="flex flex-col">
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="privacy-policy-checkbox"
                type="checkbox"
                {...register('acceptTerms')}
                className={`h-5 w-5 rounded border bg-background-light dark:bg-background-dark text-primary focus:ring-primary/50 transition-all cursor-pointer ${errors.acceptTerms ? 'border-red-500' : 'border-input-border-light dark:border-input-border-dark'}`}
                disabled={isPending}
              />
            </div>
            <label
              htmlFor="privacy-policy-checkbox"
              className="ml-3 block text-sm text-[#4c809a] dark:text-gray-400"
            >
              I agree to the{" "}
              <button
                type="button"
                onClick={() => setShowTermsModal(true)}
                className="text-primary font-semibold hover:underline"
              >
                Terms of Service
              </button>{" "}
              and{" "}
              <button
                type="button"
                onClick={() => setShowPrivacyModal(true)}
                className="text-primary font-semibold hover:underline"
              >
                Privacy Policy
              </button>
            </label>
          </div>
          {errors.acceptTerms && (
            <p className="text-red-500 text-xs mt-1 ml-8">{errors.acceptTerms.message}</p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isPending}
          className="w-full h-14 cursor-pointer rounded-lg bg-primary text-white font-semibold hover:bg-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:focus:ring-offset-background-dark disabled:opacity-50 disabled:cursor-not-allowed"
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

            <GoogleLoginButton userType={UserRole.TEACHER} />
          </>
        )}

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

      {/* Privacy Policy Modal */}
      {showPrivacyModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden transform animate-in zoom-in duration-300">
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-slate-800/50">
              <h3 className="text-xl font-bold text-[#0d171b] dark:text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">security</span>
                Privacy Policy
              </h3>
              <button 
                onClick={() => setShowPrivacyModal(false)}
                className="p-2 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-full transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-8 max-h-[60vh] overflow-y-auto text-sm leading-relaxed text-gray-600 dark:text-gray-400 space-y-4">
              <p className="font-semibold text-[#0d171b] dark:text-white">Last Updated: May 9, 2026</p>
              <p>Your privacy is important to us. We collect minimal data required for school management, including your name, email, and teaching credentials.</p>
              <p>We do not sell your data to third parties. All data is encrypted and stored securely on our servers.</p>
              <p>We use your information to:
                <ul className="list-disc ml-6 mt-2 space-y-1">
                  <li>Provide and maintain our Service</li>
                  <li>Notify you about changes to our Service</li>
                  <li>Provide customer support</li>
                  <li>Gather analysis or valuable information so that we can improve our Service</li>
                </ul>
              </p>
              <p>By using Qefas Hub, you consent to our data collection practices as outlined in this policy.</p>
            </div>
            <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-slate-800/50">
              <button
                onClick={() => setShowPrivacyModal(false)}
                className="w-full py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
              >
                I Understand
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Terms of Service Modal */}
      {showTermsModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden transform animate-in zoom-in duration-300">
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-slate-800/50">
              <h3 className="text-xl font-bold text-[#0d171b] dark:text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">gavel</span>
                Terms of Service
              </h3>
              <button 
                onClick={() => setShowTermsModal(false)}
                className="p-2 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-full transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-8 max-h-[60vh] overflow-y-auto text-sm leading-relaxed text-gray-600 dark:text-gray-400 space-y-4">
              <p className="font-semibold text-[#0d171b] dark:text-white">Last Updated: May 9, 2026</p>
              <p>By using Qefas Hub, you agree to provide accurate information and use the platform for educational purposes only.</p>
              <p>Unauthorized use, data scraping, or any attempt to compromise the security of the platform is strictly prohibited.</p>
              <p>Users are responsible for maintaining the confidentiality of their account and password. You agree to accept responsibility for all activities that occur under your account.</p>
              <p>We reserve the right to terminate accounts that violate these terms or engage in behavior harmful to other users or the platform.</p>
              <p>Qefas Hub is provided "as is" without any warranties of any kind, either express or implied.</p>
            </div>
            <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-slate-800/50">
              <button
                onClick={() => setShowTermsModal(false)}
                className="w-full py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
              >
                Accept Terms
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
