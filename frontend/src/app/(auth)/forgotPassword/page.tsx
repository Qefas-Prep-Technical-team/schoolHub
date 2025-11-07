import AuthLayout from "./components/AuthLayout";
import CardContainer from "./components/CardContainer";
import Illustration from "./components/Illustration";
import HeadlineText from "./components/HeadlineText";
import BodyText from "./components/BodyText";
import InputField from "./components/InputField";
import ButtonGroup from "./components/ButtonGroup";
import SuccessAlert from "./components/SuccessAlert";

export default function ForgotPasswordPage() {
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
                  Enter the email associated with your account and we’ll send you a reset link.
                </BodyText>
              </div>
            </div>

            <div className="flex flex-col w-full gap-6 mt-6">
              <InputField label="Email Address" placeholder="example@email.com" />
              <ButtonGroup />
            </div>
          </CardContainer>

          <SuccessAlert message="If an account with that email exists, a reset link has been sent." />
        </div>
      </div>
    </AuthLayout>
  );
}
