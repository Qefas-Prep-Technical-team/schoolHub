import AuthLayout from "./components/AuthLayout";
import AuthIllustration from "./components/AuthIllustration";
import AuthHeader from "./components/AuthHeader";
import StreakCard from "./components/StreakCard";
import LoginForm from "./components/LoginForm";

export default function StudentLoginPage() {
  return (
    <AuthLayout>
      <AuthIllustration />
      <div className="flex w-full flex-1 items-center justify-center bg-background-light p-6 dark:bg-background-dark lg:w-1/2">
        <div className="flex w-full max-w-md flex-col gap-8 py-10">
          <AuthHeader />
          <div className="flex flex-col gap-3">
            <p className="text-4xl font-black leading-tight tracking-[-0.033em]">
              Student Login
            </p>
            <p className="text-base text-[#4c669a] dark:text-gray-400">
              Enter your credentials to access your dashboard.
            </p>
          </div>
          <StreakCard />
          <LoginForm />
        </div>
      </div>
    </AuthLayout>
  );
}
