import AuthIllustration from "./components/AuthIllustration";
import AuthHeader from "./components/AuthHeader";
import LoginForm from "./components/LoginForm";

export default function StudentLoginPage() {
  return (
    <div className="relative flex min-h-screen w-full flex-col bg-slate-50 dark:bg-slate-950 transition-colors duration-500 items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-[95vw] lg:w-[65vw] max-w-[1200px] bg-white dark:bg-slate-900 md:rounded-[2.5rem] rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col md:flex-row min-h-[500px] animate-in fade-in zoom-in-95 duration-700">
        <div className="flex-1 flex flex-col justify-center p-8 sm:p-12 lg:p-16">
          <div className="w-full max-w-md mx-auto">
            <AuthHeader />
            <div className="flex flex-col gap-3 mb-10 text-left">
              <h1 className="text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tighter">
                Student Portal
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed max-w-sm">
                Welcome back. Log in to access your classes, assignments, and results.
              </p>
            </div>
            <LoginForm />
          </div>
        </div>
        <div className="hidden md:block md:w-[45%] lg:w-1/2 relative bg-slate-50 dark:bg-slate-950 p-3 lg:p-6 border-l border-slate-100 dark:border-slate-800">
          <AuthIllustration />
        </div>
      </div>
    </div>
  );
}
