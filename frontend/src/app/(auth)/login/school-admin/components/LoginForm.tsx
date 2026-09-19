"use client"
import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
// Assuming you have this component
import { useLoginMutation } from "../../services/use-auth-mutations";
import { LoginFormData, loginSchema } from "../../services/auth-schema";
import Link from "next/link";
import { ROUTES } from "@/lib/constants/routes";
import { Eye, EyeOff } from "lucide-react";

import { useGlobalFeatures } from "@/lib/api/hooks/useGlobalFeatures";

// import { adminRoleOptions } from "@/lib/constants/adminOptions"; // Commented out

export default function LoginForm() {
  const { data: globalFeatures } = useGlobalFeatures('admin');

  const [showPassword, setShowPassword] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  // const [selectedRole, setSelectedRole] = useState(''); // Commented out

  const { mutate: login, isPending } = useLoginMutation();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isDirty },
    setValue,
    watch,
    trigger,
  } = useForm<LoginFormData>({
    resolver: yupResolver(loginSchema),
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      email: "",
      password: ""
    }
  });

  const emailValue = watch('email');
  const passwordValue = watch('password');

  const onSubmit = (data: LoginFormData) => {
    login(
      { 
        email: data.email, 
        password: data.password,
        userType: "ADMIN" // Hardcoded as ADMIN for admin login
      },
      {
        onError: (error) => {
          // Toast is handled in useLoginMutation
        },
      }
    );
  };

  const handleInputChange = (field: keyof LoginFormData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setValue(field, value, { shouldValidate: true, shouldDirty: true });
    };

  const handleBlur = (field: keyof LoginFormData) => async () => {
    await trigger(field);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setValue('password', value, { shouldValidate: true, shouldDirty: true });
  };

  const handlePasswordBlur = async () => {
    await trigger('password');
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Commented out role badge function
  // const getBadgeColor = (roleValue: string) => {
  //   const role = adminRoleOptions.find(r => r.value === roleValue);
  //   return role?.badgeColor || 'gray';
  // };

  // Disable button when form is invalid or during submission
  const isSubmitDisabled = isPending || !isValid || !isDirty;

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="w-full flex flex-col space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div>
        <label className="flex flex-col">
          <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pb-2 ml-1">
            Email Address
          </p>
          <input
            type="email"
            placeholder="admin@school.edu"
            value={emailValue || ""}
            onChange={handleInputChange('email')}
            onBlur={handleBlur('email')}
            className="flex w-full rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white h-14 px-6 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all duration-300 font-medium placeholder:text-slate-400 dark:placeholder:text-slate-600 shadow-sm"
          />
        </label>
        {errors.email && (
          <p className="text-red-500 text-[10px] font-bold mt-2 ml-2 uppercase tracking-wide animate-fadeIn">
            {errors.email.message}
          </p>
        )}
      </div>

      <div>
        <label className="flex flex-col group">
          <div className="flex justify-between items-baseline">
            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pb-2 ml-1">
              Password
            </p>
          </div>

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••••••"
              value={passwordValue || ""}
              onChange={handlePasswordChange}
              onBlur={handlePasswordBlur}
              className="flex w-full rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white h-14 pl-6 pr-14 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all duration-300 font-medium placeholder:text-slate-400 dark:placeholder:text-slate-600 shadow-sm"
            />
            <button
              type="button"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors h-8 w-8 flex items-center justify-center rounded-full"
              onClick={togglePasswordVisibility}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <div className="flex justify-end mt-2">
            <Link
              href={ROUTES.AUTH.FORGOT_PASSWORD}
              className="text-[10px] font-black text-blue-500 hover:text-blue-400 uppercase tracking-widest transition-colors duration-200"
            >
              Forgot Password?
            </Link>
          </div>
        </label>
        {errors.password && (
          <p className="text-red-500 text-[10px] font-bold mt-2 ml-2 uppercase tracking-wide animate-fadeIn">
            {errors.password.message}
          </p>
        )}
      </div>


      <div className="pt-4">
        <button
          type="submit"
          disabled={isSubmitDisabled}
          className="flex h-14 w-full cursor-pointer items-center justify-center rounded-full bg-blue-600 text-sm font-bold tracking-wide text-white shadow-lg shadow-blue-500/30 transition-all duration-300 hover:bg-blue-700 hover:-translate-y-0.5 active:translate-y-0 focus:outline-none focus:ring-4 focus:ring-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0"
        >
          {isPending ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/20 border-b-white mr-3"></div>
              Signing in...
            </div>
          ) : (
            "Sign In"
          )}
        </button>
      </div>

      <p className="mt-20 text-center text-xs text-slate-500 dark:text-slate-400 font-medium max-w-xs mx-auto">
        By signing in you agree to Qefas Hub&apos;s <br />
        <button type="button" onClick={() => setShowTermsModal(true)} className="text-blue-600 dark:text-blue-400 hover:underline font-bold cursor-pointer bg-transparent border-none p-0 outline-none">Terms of Services</button>
        {" "}and{" "}
        <button type="button" onClick={() => setShowPrivacyModal(true)} className="text-blue-600 dark:text-blue-400 hover:underline font-bold cursor-pointer bg-transparent border-none p-0 outline-none">Privacy Policy</button>.
      </p>

    </form>

    {/* Privacy Policy Modal */}
    {showPrivacyModal && (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden transform animate-in zoom-in duration-300">
          <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-slate-800/50">
            <h3 className="text-xl font-bold text-[#0d171b] dark:text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-600">security</span>
              Privacy Policy
            </h3>
            <button 
              onClick={() => setShowPrivacyModal(false)}
              className="p-2 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-500"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>
          <div className="p-8 max-h-[60vh] overflow-y-auto text-sm leading-relaxed text-gray-600 dark:text-gray-400 space-y-4">
            <p className="font-semibold text-[#0d171b] dark:text-white">Last Updated: May 9, 2026</p>
            <p>Your privacy is important to us. We collect minimal data required for school management, including your name, email, and credentials.</p>
            <p>We do not sell your data to third parties. All data is encrypted and stored securely on our servers.</p>
            <p>We use your information to:</p>
              <ul className="list-disc ml-6 mt-2 space-y-1">
                <li>Provide and maintain our Service</li>
                <li>Notify you about changes to our Service</li>
              </ul>
            <p>By using Qefas Hub, you consent to our data collection practices as outlined in this policy.</p>
          </div>
          <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-slate-800/50">
            <button
              onClick={() => setShowPrivacyModal(false)}
              className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/30"
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
              <span className="material-symbols-outlined text-blue-600">gavel</span>
              Terms of Service
            </h3>
            <button 
              onClick={() => setShowTermsModal(false)}
              className="p-2 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-500"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>
          <div className="p-8 max-h-[60vh] overflow-y-auto text-sm leading-relaxed text-gray-600 dark:text-gray-400 space-y-4">
            <p className="font-semibold text-[#0d171b] dark:text-white">Last Updated: May 9, 2026</p>
            <p>By using Qefas Hub, you agree to provide accurate information and use the platform for educational purposes only.</p>
            <p>Unauthorized use, data scraping, or any attempt to compromise the security of the platform is strictly prohibited.</p>
            <p>Users are responsible for maintaining the confidentiality of their account and password. You agree to accept responsibility for all activities that occur under your account.</p>
            <p>We reserve the right to terminate accounts that violate these terms or engage in behavior harmful to other users or the platform.</p>
            <p>Qefas Hub is provided &ldquo;as is&rdquo; without any warranties of any kind, either express or implied.</p>
          </div>
          <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-slate-800/50">
            <button
              onClick={() => setShowTermsModal(false)}
              className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/30"
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

// force reload

