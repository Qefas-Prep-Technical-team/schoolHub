import Header from "./components/Header";
import ResetPasswordForm from "./components/ResetPasswordForm";

export default function ResetPasswordPage() {
  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark overflow-x-hidden">
      <div className="layout-container flex h-full grow flex-col">
        {/* <Header /> */}
        <div className="flex flex-1 items-center justify-center p-4 sm:p-6 lg:p-8">
          <div className="flex w-full max-w-md flex-col items-center gap-8 rounded-xl bg-white dark:bg-background-dark dark:border dark:border-white/10 p-8 shadow-sm">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
              <span className="material-symbols-outlined !text-4xl">
                shield_lock
              </span>
            </div>

            <div className="flex flex-col gap-3 text-center">
              <p className="text-[#0e121b] dark:text-white text-3xl font-black leading-tight tracking-[-0.033em]">
                Reset Your Password 🔐
              </p>
              <p className="text-[#4d6599] dark:text-slate-400 text-base font-normal leading-normal">
                Create a new password to secure your account.
              </p>
            </div>

            <ResetPasswordForm />
          </div>
        </div>
      </div>
    </div>
  );
}
