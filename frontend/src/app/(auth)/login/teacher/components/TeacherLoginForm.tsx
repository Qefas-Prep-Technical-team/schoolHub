"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

import { useLoginMutation } from "../../services/use-auth-mutations";
import { LoginFormData, loginSchema } from "../../services/auth-schema";
import Link from "next/link";
import { ROUTES } from "@/lib/constants/routes";

import { useGlobalFeatures } from "@/lib/api/hooks/useGlobalFeatures";


export default function TeacherLoginForm() {
    const { data: globalFeatures } = useGlobalFeatures('teacher');

    const [showPassword, setShowPassword] = useState(false);

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

    const togglePasswordVisibility = () => setShowPassword(!showPassword);

    const isSubmitDisabled = isPending || !isValid || !isDirty;

    return (
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">

            {/* Email */}
            <div className="flex flex-col">
                <input
                    type="email"
                    placeholder="Email address"
                    value={emailValue || ""}
                    onChange={handleInputChange("email")}
                    onBlur={handleBlur("email")}
                    className="flex w-full rounded-full border border-slate-200 dark:border-slate-800 bg-transparent text-slate-900 dark:text-white h-14 px-6 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all duration-300 font-medium placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
                {errors.email && (
                    <p className="text-red-500 text-[10px] font-bold mt-2 ml-4 uppercase tracking-wide animate-fadeIn">
                        {errors.email.message}
                    </p>
                )}
            </div>

            {/* Password */}
            <div className="flex flex-col">
                <div className="relative flex w-full">
                    <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        value={passwordValue || ""}
                        onChange={handleInputChange("password")}
                        onBlur={handleBlur("password")}
                        className="flex w-full rounded-full border border-slate-200 dark:border-slate-800 bg-transparent text-slate-900 dark:text-white h-14 px-6 pr-12 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all duration-300 font-medium placeholder:text-slate-400 dark:placeholder:text-slate-500"
                    />
                    <button
                        type="button"
                        onClick={togglePasswordVisibility}
                        className="absolute inset-y-0 right-0 flex items-center pr-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                    >
                        <span className="material-symbols-outlined text-[20px]">
                            {showPassword ? 'visibility_off' : 'visibility'}
                        </span>
                    </button>
                </div>
                {errors.password && (
                    <p className="text-red-500 text-[10px] font-bold mt-2 ml-4 uppercase tracking-wide animate-fadeIn">
                        {errors.password.message}
                    </p>
                )}
            </div>

            <div className="flex justify-end -mt-2">
                <Link 
                    href={ROUTES.AUTH.FORGOT_PASSWORD} 
                    className="text-[10px] font-black text-emerald-500 hover:text-emerald-400 uppercase tracking-widest transition-colors duration-200 mr-2"
                >
                    Forgot Password?
                </Link>
            </div>

            {/* Login Button */}
            <div className="pt-2">
                <button
                    type="submit"
                    disabled={isSubmitDisabled}
                    className="flex h-14 w-full cursor-pointer items-center justify-center rounded-full bg-[#8bc34a] hover:bg-[#7cb342] text-sm font-bold text-white shadow-lg shadow-[#8bc34a]/20 transition-all duration-300 active:scale-[0.98] focus:outline-none focus:ring-4 focus:ring-[#8bc34a]/30 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isPending ? (
                        <div className="flex items-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/20 border-b-white mr-3"></div>
                            Signing in...
                        </div>
                    ) : (
                        "Sign in"
                    )}
                </button>
            </div>

            <div className="mt-8 text-center text-xs font-medium text-slate-500 dark:text-slate-400">
                <p>
                    By signing in you agree to Qefas Hub&apos;s
                </p>
                <p className="mt-1">
                    <button type="button" className="text-emerald-500 hover:text-emerald-600 font-bold transition-colors">Terms of Services</button>
                    {" "}and{" "}
                    <button type="button" className="text-emerald-500 hover:text-emerald-600 font-bold transition-colors">Privacy Policy</button>.
                </p>
            </div>

        </form>
    );
}
