import ResetPasswordForm from "./components/ResetPasswordForm";
import LogoTitle from "../../../verification/components/LogoTitle";

export default function ResetPasswordPage() {
  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center p-4 sm:p-6 lg:p-8 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-indigo-500/30 overflow-hidden font-sans transition-colors duration-500">
      {/* Background Ambient Glow Lights */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-[15%] -left-[15%] w-[50%] h-[50%] bg-gradient-to-br from-indigo-500/10 via-blue-500/10 to-transparent rounded-full blur-[140px] animate-pulse" />
        <div className="absolute top-[30%] -right-[15%] w-[45%] h-[45%] bg-gradient-to-tl from-violet-500/10 via-purple-500/10 to-transparent rounded-full blur-[140px] animate-pulse delay-1000" />
      </div>

      <div className="w-full max-w-lg space-y-6 z-10 animate-in fade-in zoom-in-95 duration-500">
        <LogoTitle />
        <div className="relative overflow-hidden w-full rounded-3xl bg-white/90 dark:bg-slate-900/80 backdrop-blur-2xl p-8 sm:p-10 border border-slate-200/80 dark:border-slate-800/80 shadow-2xl shadow-slate-200/50 dark:shadow-none space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              Reset Your Password
            </h1>
            <p className="text-xs sm:text-sm leading-relaxed text-slate-500 dark:text-slate-400 font-medium">
              Create a new secure password for your account.
            </p>
          </div>
          <ResetPasswordForm />
        </div>
      </div>
    </div>
  );
}
