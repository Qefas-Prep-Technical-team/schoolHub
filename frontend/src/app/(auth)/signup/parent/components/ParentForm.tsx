/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { UserRole } from '@/lib/types/user.types';
import { ParentFormData, parentSchema } from '../../services/regSchema';
import { useParentRegistration } from '../../services/useRegistrationMutations';
import { useRouter, useSearchParams } from 'next/navigation';
import { getPasswordStrength } from '../../school/components/SchoolCard';
import GoogleLoginButton from '../../../login/components/GoogleLoginButton';
import RedirectOverlay from '@/components/ui/RedirectOverlay';
import { useGlobalFeatures } from "@/lib/api/hooks/useGlobalFeatures";

export default function ParentRegistrationForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ strength: 0, message: '' });
  const [showOverlay, setShowOverlay] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const searchParams = useSearchParams();

  const { mutate: registerParent, isPending } = useParentRegistration();
  const { data: globalFeatures } = useGlobalFeatures('parent');
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue
  } = useForm<ParentFormData>({
    resolver: yupResolver(parentSchema) as any,
    mode: 'onBlur',
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      studentCode: searchParams.get('studentCode') || '',
      acceptTerms: false
    }
  });

  const router = useRouter();

  // Sync with search params if they change
  useEffect(() => {
    if (searchParams.get('studentCode')) setValue('studentCode', searchParams.get('studentCode') || '');
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

  const onSubmit = async (data: ParentFormData) => {
    try {
      // Transform data to match your backend expectations
      const backendData = {
        fullName: data.fullName.trim(),
        email: data.email.toLowerCase().trim(),
        password: data.password,
        confirmPassword: data.confirmPassword,
        acceptTerms: data.acceptTerms,
        ...(data.studentCode && { studentCode: data.studentCode.trim() })
      };

      await registerParent(backendData, {
        onSuccess: (response: any) => {
          // console.log('✅ Parent registration successful:', response.data);

          // Redirect to login after delay
          const email = response.data.data.parent.email

          setShowOverlay(true);
          reset();

          setTimeout(() => {
            router.push(
              `/verification?email=${encodeURIComponent(email)}&userType=${UserRole.PARENT}&requestCode=true`,
            );
          }, 2000);
        },
        onError: (error: any) => {
          console.error('❌ Parent registration failed:', error);
          // Toast is handled in useParentRegistration
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
        <div className="flex flex-col gap-3 p-4">
          <h1 className="text-4xl font-black leading-tight tracking-[-0.033em] text-[#0d171b] dark:text-white">
            Join Qefas Hub as a Parent
          </h1>
          <p className="text-lg font-normal leading-normal text-[#4c809a] dark:text-gray-400">
            Stay connected to your child&apos;s progress and school updates.
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

          {/* Privacy and Policy Checkbox */}
          <div className="flex flex-col pt-2">
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
            className="group relative flex h-14 w-full cursor-pointer items-center justify-center rounded-xl bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 dark:from-indigo-500 dark:via-blue-500 dark:to-indigo-600 text-base font-bold text-white shadow-lg shadow-indigo-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/40 hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-indigo-500/30 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none overflow-hidden"
          >
            <div className="absolute inset-0 w-full h-full bg-white/10 group-hover:bg-white/20 transition-colors duration-300" />
            <div className="relative z-10 flex items-center justify-center">
              {isPending ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                  Creating Account...
                </>
              ) : (
                'Create Parent Account'
              )}
            </div>
          </button>

          {globalFeatures?.googleLogin !== false && (
              <GoogleLoginButton userType={UserRole.PARENT} />
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
              <p>Your privacy is important to us. We collect minimal data required to stay connected to your child&apos;s progress, including your name and contact details.</p>
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
              <p>By using Qefas Hub, you agree to provide accurate information and use the platform for monitoring your child&apos;s educational progress only.</p>
              <p>Unauthorized use, data scraping, or any attempt to compromise the security of the platform is strictly prohibited.</p>
              <p>Users are responsible for maintaining the confidentiality of their account and password. You agree to accept responsibility for all activities that occur under your account.</p>
              <p>We reserve the right to terminate accounts that violate these terms or engage in behavior harmful to other users or the platform.</p>
              <p>Qefas Hub is provided &ldquo;as is&rdquo; without any warranties of any kind, either express or implied.</p>
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
