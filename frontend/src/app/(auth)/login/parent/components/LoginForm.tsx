"use client"
import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

import InputField from "./InputField";
import LoginButton from "./LoginButton";
import { useLoginMutation } from "../../services/use-auth-mutations";
import { LoginFormData, loginSchema } from "../../services/auth-schema";
import Link from "next/link";
import { ROUTES } from "@/lib/constants/routes";
import GoogleLoginButton from "../../components/GoogleLoginButton";
import { useGlobalFeatures } from "@/lib/api/hooks/useGlobalFeatures";

export default function LoginForm() {


    const { mutate: login, isPending } = useLoginMutation();
    const { data: globalFeatures } = useGlobalFeatures('parent');

    const {
        register,
        handleSubmit,
        formState: { errors, isValid, isDirty },
        setValue,
        watch,
        trigger,
        formState,
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
            { email: data.email, password: data.password, userType: "PARENT" },
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
            setValue(field, value, { shouldValidate: true });
        };

    const handleBlur = (field: keyof LoginFormData) => async () => {
        await trigger(field);
    };

    // Disable button when form is invalid or during submission
    const isSubmitDisabled = isPending

    // Add this to debug
    console.log("Form state:", { isValid, isDirty, isSubmitDisabled, errors });

    return (
        <div className="flex w-full max-w-md mx-auto flex-col justify-center gap-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <div className="flex flex-col gap-3 text-left mb-4">
                <h2 className="text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tighter">Parent Portal</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed max-w-sm">
                    Enter your guardian credentials to access real-time insights into your child&apos;s academic ecosystem.
                </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-6">
                <div>
                    <InputField
                        label="Email Address"
                        icon="mail"
                        type="email"
                        placeholder="parent@school.edu"
                        value={emailValue || ""}
                        onChange={handleInputChange('email')}
                        onBlur={handleBlur('email')}
                        required
                    />
                    {errors.email && (
                        <p className="text-red-500 text-[10px] font-bold mt-2 ml-2 uppercase tracking-wide animate-fadeIn">
                            {errors.email.message}
                        </p>
                    )}
                </div>

                <div>
                    <InputField
                        label="Password"
                        icon="lock"
                        type="password"
                        placeholder="••••••••••••"
                        value={passwordValue || ""}
                        onChange={handleInputChange('password')}
                        onBlur={handleBlur('password')}
                        required
                    />
                    {errors.password && (
                        <p className="text-red-500 text-[10px] font-bold mt-2 ml-2 uppercase tracking-wide animate-fadeIn">
                            {errors.password.message}
                        </p>
                    )}
                </div>



                <div className="pt-2">
                    <LoginButton disabled={isSubmitDisabled} />
                </div>

                {globalFeatures?.googleLogin !== false && (
                    <>
                        <div className="relative flex items-center py-4">
                            <div className="flex-grow border-t border-slate-100 dark:border-slate-800"></div>
                            <span className="flex-shrink-0 mx-6 text-[10px] uppercase font-black tracking-[0.2em] text-slate-400 dark:text-slate-500">Or continue with</span>
                            <div className="flex-grow border-t border-slate-100 dark:border-slate-800"></div>
                        </div>
                        
                        <GoogleLoginButton userType="PARENT" />
                    </>
                )}

                <div className="flex justify-end mt-2">
                    <Link 
                        href={ROUTES.AUTH.FORGOT_PASSWORD} 
                        className="text-[10px] font-black text-indigo-500 hover:text-indigo-400 uppercase tracking-widest transition-colors duration-200"
                    >
                        Forgot Password?
                    </Link>
                </div>
            </form>
        </div>
    );
}
