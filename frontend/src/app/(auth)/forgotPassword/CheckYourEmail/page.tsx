// app/check-email/page.tsx
"use client";
import { useSearchParams } from "next/navigation";
import AuthLayout from "./components/AuthLayout";
import CardContainer from "./components/CardContainer";
import IconCircle from "./components/IconCircle";
import HeadlineText from "./components/HeadlineText";
import BodyText from "./components/BodyText";
import ButtonGroup from "./components/ButtonGroup";

export default function CheckEmailPage() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email');

  return (
    <AuthLayout>
      <div className="flex flex-1 justify-center items-center py-10 px-4 sm:px-6 lg:px-8">
        <div className="layout-content-container flex flex-col w-full max-w-md">
          <CardContainer>
            <IconCircle icon="mail" />
            <HeadlineText>Check Your Email 📩</HeadlineText>
            <BodyText>
              {email ? (
                <>
                  We&apos;ve sent a password reset link to <strong className="text-primary">{email}</strong>. 
                  Please check your inbox or spam folder.
                </>
              ) : (
                "We've sent a password reset link to your registered email. Please check your inbox or spam folder."
              )}
            </BodyText>
            <ButtonGroup />
          </CardContainer>
        </div>
      </div>
    </AuthLayout>
  );
}