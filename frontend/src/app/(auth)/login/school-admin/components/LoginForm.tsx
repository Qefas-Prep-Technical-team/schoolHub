"use client"
import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
// Assuming you have this component
import { useLoginMutation } from "../../services/use-auth-mutations";
import { LoginFormData, loginSchema } from "../../services/auth-schema";
import PasswordField from "../../student/components/PasswordField";
import Link from "next/link";
import { ROUTES } from "@/lib/constants/routes";

import { useGlobalFeatures } from "@/lib/api/hooks/useGlobalFeatures";

// import { adminRoleOptions } from "@/lib/constants/adminOptions"; // Commented out

export default function LoginForm() {
  const { data: globalFeatures } = useGlobalFeatures('admin');

  const [showPassword, setShowPassword] = useState(false);
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
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
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
            className="flex w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-slate-900 dark:text-white h-14 px-5 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all duration-300 font-medium placeholder:text-slate-400 dark:placeholder:text-slate-600"
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

          <PasswordField
            value={passwordValue || ""}
            onChange={handlePasswordChange}
            onBlur={handlePasswordBlur}
            showPassword={showPassword}
            onTogglePassword={togglePasswordVisibility}
            placeholder="••••••••••••"
          />

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
          className="flex h-14 w-full cursor-pointer items-center justify-center rounded-2xl bg-blue-600 dark:bg-blue-500 text-[11px] font-black uppercase tracking-[0.2em] text-white shadow-xl shadow-blue-500/25 transition-all duration-300 hover:bg-blue-500 hover:-translate-y-0.5 active:translate-y-0 focus:outline-none focus:ring-4 focus:ring-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0"
        >
          {isPending ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/20 border-b-white mr-3"></div>
              Signing in...
            </div>
          ) : (
            "Sign In"
          )}
        </button>
      </div>


    </form>
  );
}
