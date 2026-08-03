import AuthImageSection from "./components/AuthImageSection";
import LoginForm from "./components/LoginForm";

export default function ParentLoginPage() {
  return (
    <div className="relative flex min-h-screen w-full flex-col bg-slate-50 dark:bg-slate-950 transition-colors duration-500">
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 mt-12 md:mt-16">
        <div className="w-[95vw] lg:w-[65vw] max-w-[1200px] bg-white dark:bg-slate-900 md:rounded-[2.5rem] rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col md:flex-row min-h-[650px] animate-in fade-in zoom-in-95 duration-700">
          <div className="flex-1 flex flex-col justify-center p-8 sm:p-12 lg:p-16">
            <LoginForm />
          </div>
          <div className="hidden md:block md:w-[45%] lg:w-1/2 relative bg-slate-50 dark:bg-slate-950 p-3 lg:p-6 border-l border-slate-100 dark:border-slate-800">
            <AuthImageSection />
          </div>
        </div>
      </main>
    </div>
  );
}
