"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Eye, EyeOff, Loader2 } from "lucide-react";

import { useLoginMutation } from "../../services/use-auth-mutations";
import { LoginFormData, loginSchema } from "../../services/auth-schema";
import Link from "next/link";
import { ROUTES } from "@/lib/constants/routes";
import { useGlobalFeatures } from "@/lib/api/hooks/useGlobalFeatures";
import SocialAuthRow from "../../components/SocialAuthRow";

export default function TeacherLoginForm() {
  const { data: globalFeatures } = useGlobalFeatures('teacher');
  const [showPassword, setShowPassword] = useState(false);
  const { mutate: login, isPending } = useLoginMutation();

  const {
    handleSubmit,
    formState: { errors, isValid, isDirty },
    setValue,
    watch,
    trigger,
  } = useForm<LoginFormData>({
    resolver: yupResolver(loginSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const emailValue = watch("email");
  const passwordValue = watch("password");

  const onSubmit = (data: LoginFormData) => {
    login(
      { email: data.email, password: data.password, userType: "TEACHER" },
      {
        onError: () => {
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

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  const isSubmitDisabled = isPending || !isValid || !isDirty;

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="w-full flex flex-col gap-5 sm:gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Email Input */}
      <div className="w-full flex flex-col">
        <label className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5 ml-1">
          Email Address
        </label>
        <input
          type="email"
          placeholder="teacher@school.edu"
          value={emailValue || ""}
          onChange={handleInputChange("email")}
          onBlur={handleBlur("email")}
          className="flex w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/80 text-slate-900 dark:text-white h-14 sm:h-15 px-5 sm:px-6 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all duration-300 text-base font-medium placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-sm"
        />
        {errors.email && (
          <p className="text-red-500 text-xs font-bold mt-1.5 ml-2 animate-fadeIn">
            {errors.email.message}
          </p>
        )}
      </div>

      {/* Password Input */}
      <div className="w-full flex flex-col">
        <div className="flex items-center justify-between mb-1.5 ml-1">
          <label className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300">
            Password
          </label>
          <Link 
            href={ROUTES.AUTH.FORGOT_PASSWORD} 
            className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 transition-colors"
          >
            Forgot Password?
          </Link>
        </div>
        <div className="relative flex w-full">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="••••••••••••"
            value={passwordValue || ""}
            onChange={handleInputChange("password")}
            onBlur={handleBlur("password")}
            className="flex w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/80 text-slate-900 dark:text-white h-14 sm:h-15 px-5 sm:px-6 pr-14 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all duration-300 text-base font-medium placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-sm"
          />
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute inset-y-0 right-0 flex items-center justify-center w-14 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer transition-colors"
            title={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        {errors.password && (
          <p className="text-red-500 text-xs font-bold mt-1.5 ml-2 animate-fadeIn">
            {errors.password.message}
          </p>
        )}
      </div>

      {/* Login Button */}
      <div className="w-full pt-2">
        <button
          type="submit"
          disabled={isSubmitDisabled}
          className="flex h-14 sm:h-15 w-full cursor-pointer items-center justify-center rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-base sm:text-lg font-black text-white shadow-lg shadow-emerald-600/25 transition-all duration-300 active:scale-[0.98] focus:outline-none focus:ring-4 focus:ring-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? (
            <div className="flex items-center gap-2">
              <Loader2 className="animate-spin" size={20} />
              <span>Signing in...</span>
            </div>
          ) : (
            "Sign In"
          )}
        </button>
      </div>

      <SocialAuthRow userType="teacher" mode="signin" />

      {/* Footer Legal Terms */}
      <div className="mt-4 text-center text-xs font-medium text-slate-500 dark:text-slate-400">
        <p>By signing in you agree to Qefas Hub&apos;s</p>
        <p className="mt-1">
          <button type="button" className="text-emerald-600 dark:text-emerald-400 hover:underline font-bold transition-colors">
            Terms of Service
          </button>
          {" "}and{" "}
          <button type="button" className="text-emerald-600 dark:text-emerald-400 hover:underline font-bold transition-colors">
            Privacy Policy
          </button>.
        </p>
      </div>
    </form>
  );
}
