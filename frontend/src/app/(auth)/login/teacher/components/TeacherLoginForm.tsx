"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

import { useLoginMutation } from "../../services/use-auth-mutations";
import { LoginFormData, loginSchema } from "../../services/auth-schema";
import PasswordField from "../../student/components/PasswordField";

export default function TeacherLoginForm() {
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
    const passwordValue = watch("password");

    const onSubmit = (data: LoginFormData) => {
        setServerError("");

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
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-6">

            {/* Email */}
            <div className="flex flex-col">
                <label className="flex flex-col">
                    <p className="text-base font-medium pb-2 dark:text-gray-300">Email Address</p>
                    <input
                        type="email"
                        placeholder="Enter your email"
                        value={emailValue || ""}
                        onChange={handleInputChange("email")}
                        onBlur={handleBlur("email")}
                        className="rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-gray-700 h-14 p-[15px] text-base"
                    />
                </label>

                {errors.email && (
                    <p className="text-red-500 text-xs mt-1 ml-1">{errors.email.message}</p>
                )}
            </div>

            {/* Password */}
            <div className="flex flex-col">
                <label className="flex flex-col">
                    <p className="text-base font-medium pb-2 dark:text-gray-300">Password</p>

                    <PasswordField
                        value={passwordValue || ""}
                        onChange={handleInputChange("password")}
                        onBlur={handleBlur("password")}
                        showPassword={showPassword}
                        onTogglePassword={togglePasswordVisibility}
                    />
                </label>

                {errors.password && (
                    <p className="text-red-500 text-xs mt-1 ml-1">{errors.password.message}</p>
                )}
            </div>

            {/* Server error */}
            {serverError && (
                <div className="p-3 text-sm text-red-500 bg-red-50 rounded-lg dark:bg-red-900/20 animate-fadeIn">
                    {serverError}
                </div>
            )}

            <div className="text-right mt-1">
                <a href="#" className="text-sm font-medium text-primary hover:underline">
                    Forgot Password?
                </a>
            </div>

            {/* Login Button */}
            <button
                type="submit"
                disabled={isSubmitDisabled}
                className="flex items-center justify-center h-14 rounded-lg bg-primary text-white font-semibold hover:bg-primary/90 disabled:opacity-50"
            >
                {isPending ? (
                    <div className="flex items-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Signing In...
                    </div>
                ) : (
                    "Login as Teacher"
                )}
            </button>
        </form>
    );
}
