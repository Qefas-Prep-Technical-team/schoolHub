// app/forgot-password/page.tsx
"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import AuthLayout from "./components/AuthLayout";
import CardContainer from "./components/CardContainer";
import Illustration from "./components/Illustration";
import HeadlineText from "./components/HeadlineText";
import BodyText from "./components/BodyText";
import InputField from "./components/InputField";
import ButtonGroup from "./components/ButtonGroup";
import SuccessAlert from "./components/SuccessAlert";
import { ResetPasswordRequestFormData, resetPasswordRequestSchema } from "./services/schemas";
import { useRequestPasswordResetMutation } from "./services/mutations";
import { useRouter } from "next/navigation";


export default function ForgotPasswordPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [serverError, setServerError] = useState("");
  const router = useRouter()

  const { mutate: requestReset, isPending } = useRequestPasswordResetMutation();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    watch,
    trigger,
  } = useForm<ResetPasswordRequestFormData>({
    resolver: yupResolver(resetPasswordRequestSchema),
    mode: 'onChange',
    defaultValues: {
      email: "",
    }
  });

  const emailValue = watch('email');

  const onSubmit = (data: ResetPasswordRequestFormData) => {
    setServerError("");
    requestReset(data.email, {
      onSuccess: () => {
        setIsSubmitted(true);
        setSubmittedEmail(data.email);
         // Pass email via URL params
        router.push(`/forgotPassword/CheckYourEmail?email=${encodeURIComponent(data.email)}`);
      },
      onError: (error) => {
        setServerError(error.message);
      },
    });
  };

  const handleInputChange = (value: string) => {
    setValue('email', value, { shouldValidate: true });
    if (serverError) setServerError("");
  };

  const handleBlur = async () => {
    await trigger('email');
  };

  return (
    <AuthLayout>
      <div className="px-4 flex flex-1 justify-center items-center py-10 sm:py-20">
        <div className="layout-content-container flex flex-col w-full max-w-md flex-1">
          <CardContainer>
            <div className="flex flex-col items-center justify-center gap-4 text-center">
              <Illustration />
              <div className="flex flex-col gap-2">
                <HeadlineText>Forgot Your Password?</HeadlineText>
                <BodyText>
                  Enter the email associated with your account and we&apos;ll send you a reset link.
                </BodyText>
              </div>
            </div>

            <div className="flex flex-col w-full gap-6 mt-6">
              <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-6">
                <div>
                  <InputField 
                    label="Email Address" 
                    placeholder="example@email.com"
                    value={emailValue}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    error={errors.email?.message}
                    disabled={isPending}
                  />
                </div>
                
                {serverError && (
                  <div className="p-3 text-sm text-red-500 bg-red-50 rounded-lg dark:bg-red-900/20 dark:text-red-400 animate-fadeIn">
                    {serverError}
                  </div>
                )}

                <ButtonGroup 
                  isPending={isPending}
                  isValid={isValid}
                  onSubmit={handleSubmit(onSubmit)}
                />
              </form>
            </div>
          </CardContainer>

          {isSubmitted && (
            <SuccessAlert 
              message={`If an account with the email ${submittedEmail} exists, a reset link has been sent.`} 
            />
          )}
        </div>
      </div>
    </AuthLayout>
  );
}