import LoginForm from "./LoginForm";
import TwoFactorForm from "../../components/TwoFactorForm";
import { useAuthStore } from "../../services/auth-store";

export default function LoginCard() {
  const user = useAuthStore((state) => state.user);

  return (
    <div className="flex flex-col">
      <div className="text-center mb-10">
        <h1 className="text-4xl lg:text-5xl font-extrabold text-slate-800 dark:text-white tracking-tight">
          Admin Sign In
        </h1>
        <p className="mt-4 text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed max-w-sm mx-auto">
          Welcome back. Sign in to oversee and manage your school&apos;s operations.
        </p>
      </div>

      {user?.require2FA ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden mt-6">
          <TwoFactorForm />
        </div>
      ) : (
        <LoginForm />
      )}
    </div>
  );
}
