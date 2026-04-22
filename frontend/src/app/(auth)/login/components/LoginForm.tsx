/* eslint-disable @typescript-eslint/no-explicit-any */
// components/forms/LoginForm.tsx
"use client"
import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { LoginFormData, loginSchema } from "../services/auth-schema";
import InputField from "../parent/components/InputField";
import LoginButton from "./LoginButton";
import Link from "next/link";
import { ROUTES } from "@/lib/constants/routes";
import GoogleLoginButton from "./GoogleLoginButton";




interface LoginFormProps {
    title: string;
    subtitle?: string;
    buttonText?: string;
    userType: "PARENT" | "TEACHER" | "ADMIN" | "STUDENT";
    onLogin: (credentials: { email: string; password: string; userType: string }) => Promise<any>;
    onSuccess?: (data: any) => void;
    onError?: (error: any) => void;
    forgotPasswordLink?: string;
    onForgotPassword?: () => void;
}

export default function LoginForm({
    title,
    subtitle,
    buttonText = "Login",
    userType,
    onLogin,
    onSuccess,
    onError,
    forgotPasswordLink,
    onForgotPassword
}: LoginFormProps) {
    const [serverError, setServerError] = useState("");
    const [isPending, setIsPending] = useState(false);

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

    const onSubmit = async (data: LoginFormData) => {
        setServerError("");
        setIsPending(true);

        try {
            console.log("Form submitted with:", data);
            const result = await onLogin({
                email: data.email,
                password: data.password,
                userType
            });

            onSuccess?.(result);
        } catch (error: any) {
            const errorMessage = error.message || "Login failed";
            setServerError(errorMessage);
            onError?.(error);
        } finally {
            setIsPending(false);
        }
    };

    const handleInputChange = (field: keyof LoginFormData) =>
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value;
            setValue(field, value, { shouldValidate: true });

            // Clear server error when user starts typing again
            if (serverError) {
                setServerError("");
            }
        };

    const handleBlur = (field: keyof LoginFormData) => async () => {
        await trigger(field);
    };

    // Disable button when form is invalid or during submission
    const isSubmitDisabled = !isValid || !isDirty || isPending;

    return (
        <div className="flex w-full flex-col justify-center gap-6 p-8 sm:p-12">
            <div className="flex flex-col gap-2 text-left">
                <h2 className="text-3xl font-bold text-text-light dark:text-text-dark">{title}</h2>
                {subtitle && (
                    <p className="text-base text-gray-500 dark:text-gray-400">{subtitle}</p>
                )}
            </div>

            <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
                <div>
                    <InputField
                        label="Email"
                        icon="mail"
                        type="email"
                        placeholder="Enter your email"
                        value={emailValue || ""}
                        onChange={handleInputChange('email')}
                        onBlur={handleBlur('email')}
                        required
                    />
                    {errors.email && (
                        <p className="text-red-500 text-xs mt-1 ml-1 animate-fadeIn">
                            {errors.email.message}
                        </p>
                    )}
                </div>

                <div>
                    <InputField
                        label="Password"
                        icon="lock"
                        type="password"
                        placeholder="Enter your password"
                        value={passwordValue || ""}
                        onChange={handleInputChange('password')}
                        onBlur={handleBlur('password')}
                        required
                    />
                    {errors.password && (
                        <p className="text-red-500 text-xs mt-1 ml-1 animate-fadeIn">
                            {errors.password.message}
                        </p>
                    )}
                </div>

                {serverError && (
                    <div className="p-3 text-sm text-red-500 bg-red-50 rounded-lg dark:bg-red-900/20 dark:text-red-400 animate-fadeIn">
                        {serverError}
                    </div>
                )}

                <LoginButton
                    disabled={isSubmitDisabled}
                    text={isPending ? "Signing In..." : buttonText}
                    isLoading={isPending}
                />

                {(forgotPasswordLink || onForgotPassword) && (
                    <div className="flex justify-end mt-1">
                        <Link 
                            href={forgotPasswordLink || ROUTES.AUTH.FORGOT_PASSWORD}
                            className="text-xs font-medium text-blue-500 hover:underline transition-colors duration-200"
                            onClick={onForgotPassword}
                        >
                            Forgot Password?
                        </Link>
                    </div>
                )}

                <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-gray-100 dark:border-gray-800" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white dark:bg-[#1E293B] px-4 text-gray-400 font-bold tracking-widest">
                            Or continue with
                        </span>
                    </div>
                </div>

                <GoogleLoginButton userType={userType} />
            </form>
        </div>
    );
}