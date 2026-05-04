"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

import { useLoginMutation } from "../../services/use-auth-mutations";
import { LoginFormData, loginSchema } from "../../services/auth-schema";
import PasswordField from "../../student/components/PasswordField";
import Link from "next/link";
import { ROUTES } from "@/lib/constants/routes";
import GoogleLoginButton from "../../components/GoogleLoginButton";
import { useGlobalFeatures } from "@/lib/api/hooks/useGlobalFeatures";


export default function TeacherLoginForm() {
    const { data: globalFeatures } = useGlobalFeatures('teacher');

    const [serverError, setServerError] = useState("");
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
    console.log("Email value:", emailValue);
    const passwordValue = watch("password");

    const onSubmit = (data: LoginFormData) => {
        setServerError("");
        console.log("Submitting login with data:", data);
        login(
            { email: data.email, password: data.password, userType: "TEACHER" },
            {
                onError: (error) => {
                    setServerError(error.message);
                },
            }
        );
    };

    const handleInputChange = (field: keyof LoginFormData) =>
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value;
            setValue(field, value, { shouldValidate: true, shouldDirty: true });
            if (serverError) setServerError("");
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
                <label className="flex flex-col">
                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pb-2 ml-1">
                        Professional Email
                    </p>
                    <input
                        type="email"
                        placeholder="teacher@school.edu"
                        value={emailValue || ""}
                        onChange={handleInputChange("email")}
                        onBlur={handleBlur("email")}
                        className="flex w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-slate-900 dark:text-white h-14 px-5 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all duration-300 font-medium placeholder:text-slate-400 dark:placeholder:text-slate-600"
                    />
                </label>

                {errors.email && (
                    <p className="text-red-500 text-[10px] font-bold mt-2 ml-2 uppercase tracking-wide animate-fadeIn">
                        {errors.email.message}
                    </p>
                )}
            </div>

            {/* Password */}
            <div className="flex flex-col">
                <label className="flex flex-col group">
                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pb-2 ml-1">
                        Security Phrase
                    </p>

                    <PasswordField
                        value={passwordValue || ""}
                        onChange={handleInputChange("password")}
                        onBlur={handleBlur("password")}
                        showPassword={showPassword}
                        onTogglePassword={togglePasswordVisibility}
                        placeholder="••••••••••••"
                    />
                </label>

                {errors.password && (
                    <p className="text-red-500 text-[10px] font-bold mt-2 ml-2 uppercase tracking-wide animate-fadeIn">
                        {errors.password.message}
                    </p>
                )}
            </div>

            {/* Server error */}
            {serverError && (
                <div className="p-4 text-xs font-bold text-red-500 bg-red-500/5 border border-red-500/20 rounded-2xl dark:bg-red-900/10 dark:text-red-400 animate-fadeIn">
                    {serverError}
                </div>
            )}

            <div className="flex justify-end -mt-2">
                <Link 
                    href={ROUTES.AUTH.FORGOT_PASSWORD} 
                    className="text-[10px] font-black text-indigo-500 hover:text-indigo-400 uppercase tracking-widest transition-colors duration-200"
                >
                    Recover Access
                </Link>
            </div>

            {/* Login Button */}
            <div className="pt-2">
                <button
                    type="submit"
                    disabled={isSubmitDisabled}
                    className="flex h-14 w-full items-center justify-center rounded-2xl bg-indigo-600 dark:bg-indigo-500 text-[11px] font-black uppercase tracking-[0.2em] text-white shadow-xl shadow-indigo-500/25 transition-all duration-300 hover:bg-indigo-500 hover:-translate-y-0.5 active:translate-y-0 focus:outline-none focus:ring-4 focus:ring-indigo-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isPending ? (
                        <div className="flex items-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/20 border-b-white mr-3"></div>
                            Signing in...
                        </div>
                    ) : (
                        "Sign In"
                    )}
                </button>
            </div>

            <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-slate-100 dark:border-slate-800" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase font-black tracking-[0.2em]">
                    <span className="bg-white dark:bg-slate-900 px-6 text-slate-400 dark:text-slate-500">
                        Secure SSO
                    </span>
                </div>
            </div>

            {globalFeatures?.googleLogin !== false && (
                <GoogleLoginButton userType="TEACHER" />
            )}
        </form>
    );
}
