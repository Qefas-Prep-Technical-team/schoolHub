"use client";

import { useState } from "react";
import { useLoginMutation } from "../../services/use-auth-mutations";
import Link from "next/link";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import SocialAuthRow from "../../components/SocialAuthRow";

export default function StudentLoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { mutate, isPending } = useLoginMutation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutate({ email, password, userType: "STUDENT" });
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:gap-5 w-full">
        <div className="flex flex-col w-full">
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex w-full rounded-full border border-slate-200 dark:border-slate-800 bg-transparent text-slate-900 dark:text-white h-12 sm:h-14 px-5 sm:px-6 text-sm focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 outline-none transition-all duration-300 font-medium placeholder:text-slate-400 dark:placeholder:text-slate-500"
            required
          />
        </div>
        
        <div className="flex flex-col relative w-full">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="flex w-full rounded-full border border-slate-200 dark:border-slate-800 bg-transparent text-slate-900 dark:text-white h-12 sm:h-14 pl-5 sm:pl-6 pr-12 sm:pr-14 text-sm focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 outline-none transition-all duration-300 font-medium placeholder:text-slate-400 dark:placeholder:text-slate-500"
            required
          />
          <button
            type="button"
            className="absolute right-3.5 sm:right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors h-8 w-8 flex items-center justify-center rounded-full"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <div className="flex justify-end -mt-1 sm:-mt-2 px-1">
          <Link
            href="/auth/forgot-password"
            className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 transition-colors cursor-pointer"
          >
            Forgot Password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={isPending || !email || !password}
          className="flex h-12 sm:h-14 w-full items-center justify-center rounded-full bg-rose-600 text-sm font-bold text-white shadow-lg shadow-rose-600/20 transition-all duration-300 hover:bg-rose-700 active:scale-[0.98] focus:outline-none focus:ring-4 focus:ring-rose-600/30 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {isPending ? (
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          ) : null}
          <span>Login</span>
        </button>

        <SocialAuthRow userType="student" mode="signin" />

        <div className="text-center mt-2 sm:mt-4">
          <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500 max-w-[280px] mx-auto leading-relaxed">
            By signing in you agree to Qefas Hub&apos;s{" "}
            <Link href="/terms" className="text-rose-500 hover:text-rose-600 font-bold underline decoration-rose-500/30 underline-offset-2">
              Terms of Services
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-rose-500 hover:text-rose-600 font-bold underline decoration-rose-500/30 underline-offset-2">
              Privacy Policy
            </Link>.
          </p>
        </div>
      </form>
    </div>
  );
}
