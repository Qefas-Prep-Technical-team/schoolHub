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


const ENABLE_GOOGLE_AUTH = true; // Toggle this to false to disable Google Auth in the UI

export default function LoginForm() {
    const [serverError, setServerError] = useState("");

    const { mutate: login, isPending } = useLoginMutation();

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
        setServerError("");
        console.log("Form submitted with:", data);
        login(
            { email: data.email, password: data.password, userType: "PARENT" },
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
    const isSubmitDisabled = isPending

    // Add this to debug
    console.log("Form state:", { isValid, isDirty, isSubmitDisabled, errors });

    return (
        <div className="flex w-full max-w-md mx-auto flex-col justify-center gap-6 p-8 sm:p-10 lg:p-12">
            <div className="flex flex-col gap-2 text-center md:text-left mb-2">
                <h2 className="text-3xl lg:text-4xl font-extrabold text-[#0A2540] dark:text-white tracking-tight">Parent Portal</h2>
                <p className="text-base text-[#525F7F] dark:text-gray-400">Track Your Child&apos;s Progress</p>
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

                <LoginButton disabled={isSubmitDisabled} />

                {ENABLE_GOOGLE_AUTH && (
                    <>
                        <div className="relative flex items-center py-2">
                            <div className="flex-grow border-t border-gray-200 dark:border-gray-700"></div>
                            <span className="flex-shrink-0 mx-4 text-gray-400 dark:text-gray-500 text-sm">Or continue with</span>
                            <div className="flex-grow border-t border-gray-200 dark:border-gray-700"></div>
                        </div>
                        
                        <GoogleLoginButton userType="PARENT" />
                    </>
                )}

                <div className="flex justify-end mt-1">
                    <Link 
                        href={ROUTES.AUTH.FORGOT_PASSWORD} 
                        className="text-xs font-medium text-blue-500 hover:underline transition-colors duration-200"
                    >
                        Forgot Password?
                    </Link>
                </div>
            </form>
        </div>
    );
}
