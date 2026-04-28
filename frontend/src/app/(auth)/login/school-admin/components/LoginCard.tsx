import LoginForm from "./LoginForm";

export default function LoginCard() {
  return (
    <div className="flex flex-col">
      <div className="text-left mb-10">
        <h1 className="text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tighter">
          Admin Portal
        </h1>
        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed max-w-sm">
          Welcome back. Overseas, analyze, and manage your institution from the global main HQ.
        </p>
      </div>

      <LoginForm />
    </div>
  );
}
