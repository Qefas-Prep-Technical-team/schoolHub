"use client"
import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import PasswordField from "./PasswordField";
import { useLoginMutation } from "../../services/use-auth-mutations";
import { LoginFormData, loginSchema } from "../../services/auth-schema";

const ENABLE_GOOGLE_AUTH = true; // Toggle this to false to disable Google Auth in the UI

export default function LoginForm() {
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
        console.log("Student form submitted with:", data);
        login(
            { email: data.email, password: data.password, userType: "STUDENT" },
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

            // Clear server error when user starts typing again
            if (serverError) {
                setServerError("");
            }
        };

    const handleBlur = (field: keyof LoginFormData) => async () => {
        await trigger(field);
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setValue('password', value, { shouldValidate: true, shouldDirty: true });

        if (serverError) {
            setServerError("");
        }
    };

    const handlePasswordBlur = async () => {
        await trigger('password');
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    // Debug log to see form state
    console.log("Form state:", { isValid, isDirty, errors });

    // Disable button when form is invalid or during submission
    const isSubmitDisabled = isPending || !isValid || !isDirty;

    return (
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-6">
            <div className="flex flex-col">
                <label className="flex flex-col">
                    <p className="text-base font-medium pb-2 dark:text-gray-300">Email / Username</p>
                    <input
                        type="email"
                        placeholder="Enter your email or username"
                        value={emailValue || ""}
                        onChange={handleInputChange('email')}
                        onBlur={handleBlur('email')}
                        className="rounded-xl border border-[#cfd7e7] p-[15px] text-base text-[#0d121b] placeholder:text-[#4c669a] focus:border-primary focus:outline-0 dark:border-gray-600 dark:bg-background-dark/50 dark:text-white h-14"
                    />
                </label>
                {errors.email && (
                    <p className="text-red-500 text-xs mt-1 ml-1 animate-fadeIn">
                        {errors.email.message}
                    </p>
                )}
            </div>

            <div className="flex flex-col">
                <label className="flex flex-col">
                    <p className="text-base font-medium pb-2 dark:text-gray-300">Password</p>
                    <PasswordField
                        value={passwordValue || ""}
                        onChange={handlePasswordChange}
                        onBlur={handlePasswordBlur}
                        showPassword={showPassword}
                        onTogglePassword={togglePasswordVisibility}
                    />
                </label>
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

            <div className="flex flex-col gap-4">
                <button
                    type="submit"
                    disabled={isSubmitDisabled}
                    className="h-12 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 focus:ring-2 focus:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center"
                >
                    {isPending ? (
                        <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                            Signing In...
                        </div>
                    ) : (
                        "Login as Student"
                    )}
                </button>

                {ENABLE_GOOGLE_AUTH && (
                    <>
                        <div className="relative flex items-center py-1">
                            <div className="flex-grow border-t border-gray-200 dark:border-gray-700"></div>
                            <span className="flex-shrink-0 mx-4 text-gray-400 dark:text-gray-500 text-sm">Or continue with</span>
                            <div className="flex-grow border-t border-gray-200 dark:border-gray-700"></div>
                        </div>
                        
                        <button
                            type="button"
                            onClick={() => window.location.href = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/google?userType=STUDENT`}
                            className="flex w-full items-center justify-center gap-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1C2431] px-4 h-12 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50"
                        >
                            <svg className="h-5 w-5" viewBox="0 0 24 24">
                                <path
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.58c2.08-1.92 3.27-4.74 3.27-8.09z"
                                    fill="#4285F4"
                                />
                                <path
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    fill="#34A853"
                                />
                                <path
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                    fill="#FBBC05"
                                />
                                <path
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    fill="#EA4335"
                                />
                                <path d="M1 1h22v22H1z" fill="none" />
                            </svg>
                            Google
                        </button>
                    </>
                )}

                <a href="#" className="text-center text-sm font-medium text-primary hover:underline mt-2">
                    Forgot Password?
                </a>
            </div>
        </form>
    );
}