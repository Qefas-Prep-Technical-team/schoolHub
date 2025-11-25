"use client"
import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import PasswordField from "./PasswordField";
import { useLoginMutation } from "../../services/use-auth-mutations";
import { LoginFormData, loginSchema } from "../../services/auth-schema";

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
                <a href="#" className="text-center text-sm font-medium text-primary hover:underline">
                    Forgot Password?
                </a>
            </div>
        </form>
    );
}