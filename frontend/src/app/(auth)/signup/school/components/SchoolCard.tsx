/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import SchoolImageSlider from "./SchoolSlider";
import SchoolHeader from "./SchoolHeader";
import RedirectOverlay from '@/components/ui/RedirectOverlay';
import { useGlobalFeatures } from "@/lib/api/hooks/useGlobalFeatures";
import { useRouter } from 'next/navigation';
import { useSchoolRegistration } from '../../services/useRegistrationMutations';
import { SchoolFormData, schoolSchema } from '../../services/regSchema';
import { UserRole } from '@/lib/types/user.types';


// Password strength checker (same as others)
export const getPasswordStrength = (password: string) => {
  if (!password) return { strength: 0, message: "" };

  const hasMinLen = password.length >= 8;
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  const noSpaces = !/\s/.test(password);

  const meetsStrong =
    hasMinLen &&
    hasLower &&
    hasUpper &&
    hasSpecial &&
    hasNumber &&
    noSpaces;

  const meetsWeak =
    password.length >= 6 &&
    (hasLower || hasUpper);

  if (meetsStrong) {
    return { strength: 4, message: "Strong" };
  }

  if (meetsWeak) {
    return { strength: 2, message: "Weak" };
  }

  return { strength: 1, message: "Very weak" };
};

export default function SchoolCard() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ strength: 0, message: '' });
  const [showOverlay, setShowOverlay] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const router = useRouter();

  const { mutate: registerSchool, isPending } = useSchoolRegistration();
  const { data: globalFeatures } = useGlobalFeatures('admin');
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
      subdomain: '',
      acceptTerms: false
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


    try {
      // Transform data to match your backend expectations
      const backendData = {
        schoolName: data.schoolName.trim(),
        adminName: data.adminName.trim(),
        email: data.email.toLowerCase().trim(),
        password: data.password,
        confirmPassword: data.confirmPassword,
        acceptTerms: data.acceptTerms,
        ...(data.subdomain && { subdomain: data.subdomain.trim() })
      };

      await registerSchool(backendData, {
        onSuccess: (response: any) => {


          const email = response.data.data?.school?.email || data.email;

          setShowOverlay(true);
          reset();

          setTimeout(() => {
            router.push(
              `/verification?email=${encodeURIComponent(email)}&userType=${UserRole.ADMIN}&requestCode=true`,
            );
          }, 2000);
        },
        onError: (error: any) => {
          console.error('❌ School registration failed:', error);
          // Toast is handled in useSchoolRegistration
        }
      });

    } catch (error) {
      console.error('❌ Unexpected error:', error);
    }
  };

  return (
    <>
      <RedirectOverlay isVisible={showOverlay} />
      <div className="w-full bg-white dark:bg-gray-900 md:rounded-[2rem] rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-gray-100 dark:border-gray-800 overflow-hidden">
      <div className="flex flex-col lg:flex-row min-h-[450px]">
        {/* Left Form */}
        <div className="flex-1 flex flex-col justify-center p-6 sm:p-10 lg:p-12 xl:p-16">
          <SchoolHeader />
          <div className="mt-2" />
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

          {/* School Name */}
          <label className="flex flex-col gap-2">
            <p className="text-base font-medium text-gray-800 dark:text-gray-200">School Name *</p>
            <input
              {...register('schoolName')}
              className={`form-input flex w-full rounded-lg text-gray-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-blue-500/50 border bg-white dark:bg-gray-800 h-12 px-4 ${errors.schoolName
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
            Your school&apos;s web address will be: {schoolNameValue ? `${watch('subdomain') || 'your-school'}.qefashub.com` : '[schoolname].qefashub.com'}
          </p>

          {/* Admin Name */}
          <label className="flex flex-col gap-2">
            <p className="text-base font-medium text-gray-800 dark:text-gray-200">Admin Name *</p>
            <input
              {...register('adminName')}
              className={`form-input flex w-full rounded-lg text-gray-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-blue-500/50 border bg-white dark:bg-gray-800 h-12 px-4 ${errors.adminName
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
              className={`form-input flex w-full rounded-lg text-gray-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-blue-500/50 border bg-white dark:bg-gray-800 h-12 px-4 ${errors.email
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
                className={`form-input flex w-full rounded-lg text-gray-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-blue-500/50 border bg-white dark:bg-gray-800 h-12 px-4 pr-12 ${errors.password
                  ? 'border-red-500 dark:border-red-400'
                  : 'border-gray-300 dark:border-gray-600'
                  }`}
                placeholder="Create a strong password (Upper, lower, number, special)"
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
          <label className="flex flex-col gap-2">
            <p className="text-base font-medium text-gray-800 dark:text-gray-200">Confirm Password *</p>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                {...register('confirmPassword')}
                className={`form-input flex w-full rounded-lg text-gray-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-blue-500/50 border bg-white dark:bg-gray-800 h-12 px-4 pr-12 ${errors.confirmPassword
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
                className={`form-input flex-1 w-full rounded-l-lg text-gray-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-blue-500/50 border bg-white dark:bg-gray-800 h-12 px-4 ${errors.subdomain
                  ? 'border-red-500 dark:border-red-400'
                  : 'border-gray-300 dark:border-gray-600'
                  }`}
                placeholder="your-school"
                disabled={isPending}
              />
              <span className="inline-flex items-center px-4 h-12 rounded-r-lg border border-l-0 border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-sm">
                .qefashub.com
              </span>
            </div>
            {errors.subdomain && (
              <p className="text-red-500 text-sm mt-2">{errors.subdomain.message}</p>
            )}
          </label>
 
          {/* Privacy and Policy Checkbox */}
          <div className="flex flex-col pt-2">
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="privacy-policy-checkbox"
                  type="checkbox"
                  {...register('acceptTerms')}
                  className={`h-5 w-5 rounded border bg-white dark:bg-gray-800 text-blue-600 focus:ring-blue-500/50 transition-all cursor-pointer ${errors.acceptTerms ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                  disabled={isPending}
                />
              </div>
              <label
                htmlFor="privacy-policy-checkbox"
                className="ml-3 block text-sm text-gray-500 dark:text-gray-400"
              >
                I agree to the{" "}
                <button
                  type="button"
                  onClick={() => setShowTermsModal(true)}
                  className="text-blue-600 font-semibold hover:underline"
                >
                  Terms of Service
                </button>{" "}
                and{" "}
                <button
                  type="button"
                  onClick={() => setShowPrivacyModal(true)}
                  className="text-blue-600 font-semibold hover:underline"
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
          <div className="flex flex-col gap-4 pt-4">
            <button
              type="submit"
              disabled={isPending}
              className="group relative flex h-14 w-full cursor-pointer items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 via-sky-600 to-blue-700 dark:from-blue-500 dark:via-sky-500 dark:to-blue-600 text-base font-bold text-white shadow-lg shadow-blue-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-blue-500/30 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none overflow-hidden"
            >
              <div className="absolute inset-0 w-full h-full bg-white/10 group-hover:bg-white/20 transition-colors duration-300" />
              <div className="relative z-10 flex items-center justify-center">
                {isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                    Creating School Account...
                  </>
                ) : (
                  'Create School Account'
                )}
              </div>
            </button>


            <p className="text-center text-sm text-gray-600 dark:text-gray-400">
              Already have a school account?{' '}
              <a
                className="font-medium text-blue-600 hover:underline"
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
        <div className="hidden lg:block lg:w-[45%] xl:w-1/2 relative bg-gray-50 dark:bg-gray-800 p-2 lg:p-4">
          <SchoolImageSlider />
        </div>
        <PrivacyModal isOpen={showPrivacyModal} onClose={() => setShowPrivacyModal(false)} />
        <TermsModal isOpen={showTermsModal} onClose={() => setShowTermsModal(false)} />
      </div>
      </div>
    </>
  );
}

{/* Privacy Policy Modal */}
const PrivacyModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden transform animate-in zoom-in duration-300">
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-slate-800/50">
          <h3 className="text-xl font-bold text-[#0d171b] dark:text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-600">security</span>
            Privacy Policy
          </h3>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-full transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="p-8 max-h-[60vh] overflow-y-auto text-sm leading-relaxed text-gray-600 dark:text-gray-400 space-y-4">
          <p className="font-semibold text-[#0d171b] dark:text-white">Last Updated: May 9, 2026</p>
          <p>Your privacy is important to us. We collect minimal data required for school management, including your name, email, and institutional details.</p>
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
            onClick={onClose}
            className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-600/90 transition-all shadow-lg shadow-primary/20"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
};

{/* Terms of Service Modal */}
const TermsModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden transform animate-in zoom-in duration-300">
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-slate-800/50">
          <h3 className="text-xl font-bold text-[#0d171b] dark:text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-600">gavel</span>
            Terms of Service
          </h3>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-full transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="p-8 max-h-[60vh] overflow-y-auto text-sm leading-relaxed text-gray-600 dark:text-gray-400 space-y-4">
          <p className="font-semibold text-[#0d171b] dark:text-white">Last Updated: May 9, 2026</p>
          <p>By using Qefas Hub, you agree to provide accurate information and use the platform for educational management purposes only.</p>
          <p>Unauthorized use, data scraping, or any attempt to compromise the security of the platform is strictly prohibited.</p>
          <p>Users are responsible for maintaining the confidentiality of their account and password. You agree to accept responsibility for all activities that occur under your account.</p>
          <p>We reserve the right to terminate accounts that violate these terms or engage in behavior harmful to other users or the platform.</p>
          <p>Qefas Hub is provided &ldquo;as is&rdquo; without any warranties of any kind, either express or implied.</p>
        </div>
        <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-slate-800/50">
          <button
            onClick={onClose}
            className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-600/90 transition-all shadow-lg shadow-primary/20"
          >
            Accept Terms
          </button>
        </div>
      </div>
    </div>
  );
};
