import AuthIllustration from "./components/AuthIllustration";
import AuthHeader from "./components/AuthHeader";
import LoginForm from "./components/LoginForm";

export default function StudentLoginPage() {
  return (
    <div className="relative flex min-h-screen w-full flex-col bg-[#F6F9FC] dark:bg-background-dark items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-[95vw] lg:w-[65vw] max-w-[1200px] bg-white dark:bg-[#1C2431] md:rounded-[2rem] rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col md:flex-row min-h-[500px]">
        <div className="flex-1 flex flex-col justify-center p-8 sm:p-10 lg:p-12">
          <div className="w-full max-w-md mx-auto">
            <AuthHeader />
            <div className="flex flex-col gap-3 mb-8">
              <h1 className="text-3xl lg:text-4xl font-extrabold text-[#0A2540] dark:text-white tracking-tight">
                Student Login
              </h1>
              <p className="text-base text-[#525F7F] dark:text-gray-400">
                Enter your credentials to access your dashboard.
              </p>
            </div>
            <LoginForm />
          </div>
        </div>
        <div className="hidden md:block md:w-[45%] lg:w-1/2 relative bg-primary/5 dark:bg-gray-800 p-2 lg:p-4">
          <AuthIllustration />
        </div>
      </div>
    </div>
  );
}
