import AuthLayout from "./components/AuthLayout";
import ProgressBar from "./components/ProgressBar";
import CardContainer from "./components/CardContainer";
import IconCircle from "./components/IconCircle";
import HeadlineText from "./components/HeadlineText";
import BodyText from "./components/BodyText";
import ButtonGroup from "./components/ButtonGroup";

export default function CheckEmailPage() {
  return (
    <AuthLayout>
      <div className="flex flex-1 justify-center items-center py-10 px-4 sm:px-6 lg:px-8">
        <div className="layout-content-container flex flex-col w-full max-w-md">
          <ProgressBar step={2} total={3} />
          <CardContainer>
            <IconCircle icon="mail" />
            <HeadlineText>Check Your Email 📩</HeadlineText>
            <BodyText>
              We’ve sent a password reset link to your registered email. Please check your inbox or spam folder.
            </BodyText>
            <ButtonGroup />
          </CardContainer>
        </div>
      </div>
    </AuthLayout>
  );
}
