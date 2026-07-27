import React, { useState } from "react";
import { Eye, EyeOff, Lock, Mail, ArrowRight, RefreshCw, AlertCircle } from "lucide-react";
import { ROLE_OPTIONS } from "./RoleSelector";
import { UserRole } from "../../services/AuthService";
import { useAuthStore } from "../../store/useAuthStore";
import { AuthHeaderControls } from "./AuthHeaderControls";

import { getRoleTheme } from "../../theme/roleTheme";
import { KeyRound, X, CheckCircle2 } from "lucide-react";

interface AuthLoginFormProps {
  role: UserRole;
  onSuccess?: () => void;
  onSwitchToRegister?: () => void;
}

export const AuthLoginForm: React.FC<AuthLoginFormProps> = ({ role, onSuccess, onSwitchToRegister }) => {
  const roleOption = ROLE_OPTIONS.find((r) => r.role === role) || ROLE_OPTIONS[0];
  const Icon = roleOption.icon;
  const roleTheme = getRoleTheme(role);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSuccess, setForgotSuccess] = useState(false);

  const { login, isLoading, authError } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;

    const result = await login({
      email: email.trim(),
      password,
      userType: role,
    });

    if (result.success && onSuccess) {
      onSuccess();
    }
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) return;
    setForgotSuccess(true);
    setTimeout(() => {
      setForgotSuccess(false);
      setShowForgotModal(false);
      setForgotEmail("");
    }, 2500);
  };

  return (
    <div className="w-full max-w-xl mx-auto space-y-6">
      {/* Login Card Container */}
      <div className="relative rounded-2xl border border-slate-200 dark:border-slate-700/50 bg-white/90 dark:bg-slate-900/80 p-8 md:p-10 shadow-lg dark:shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] space-y-8 backdrop-blur-xl">
        {/* Card Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`h-12 w-12 rounded-xl ${roleTheme.avatarBg} flex items-center justify-center shadow-lg`}>
              <Icon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                {roleOption.title} Sign In
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Enter your credentials to access your workspace.
              </p>
            </div>
          </div>

          <AuthHeaderControls />
        </div>

        {/* Error Alert Banner */}
        {authError && (
          <div className="flex items-center gap-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800/80 p-3.5 text-xs text-rose-700 dark:text-rose-300 shadow-md">
            <AlertCircle className="h-4 w-4 text-rose-500 dark:text-rose-400 flex-shrink-0" />
            <span>{authError}</span>
          </div>
        )}

        {/* Form Fields */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-extrabold text-slate-600 dark:text-slate-400 uppercase tracking-widest">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400 dark:text-slate-500" />
              <input
                type="email"
                required
                placeholder={
                  role === "ADMIN"
                    ? "admin@school.edu"
                    : role === "TEACHER"
                    ? "teacher@school.edu"
                    : role === "STUDENT"
                    ? "student@school.edu"
                    : "parent@gmail.com"
                }
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700/50 bg-slate-50 dark:bg-slate-900/50 pl-10 pr-4 py-3 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all duration-300"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-extrabold text-slate-600 dark:text-slate-400 uppercase tracking-widest">
                Password
              </label>
              <button
                type="button"
                onClick={() => {
                  setForgotEmail(email);
                  setShowForgotModal(true);
                }}
                className={`text-xs font-bold ${roleTheme.activeNavText} hover:underline transition-colors cursor-pointer`}
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-700/50 bg-slate-900/50 pl-10 pr-10 py-3 text-xs text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:bg-slate-900 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all duration-300"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3 text-slate-500 hover:text-slate-300 transition"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Submit Action Button */}
          <button
            type="submit"
            disabled={isLoading || !email.trim() || !password}
            className={`w-full mt-4 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r ${roleOption.badgeColor} py-3.5 text-sm font-bold shadow-[0_0_20px_-5px_rgba(0,0,0,0.5)] hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 transition-all duration-300`}
          >
            {isLoading ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <span>Sign In to {roleOption.title} Portal</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        {/* Don't have an account link */}
        <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 pt-1">
          <span>Don&apos;t have an account?</span>
          <button
            type="button"
            onClick={onSwitchToRegister}
            className={`font-bold ${roleTheme.activeNavText} hover:underline transition-colors`}
          >
            Create {roleOption.title} Account
          </button>
        </div>

        {/* Footer Note */}
        <div className="text-center text-[11px] text-slate-500 border-t border-slate-800/60 pt-3">
          Supports offline authentication via cached SQLite credentials.
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-slate-900 border border-slate-700/50 rounded-2xl shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] w-full max-w-md overflow-hidden p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-xl ${roleTheme.avatarBg} flex items-center justify-center shadow-md`}>
                  <KeyRound className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-100">Reset Password</h3>
                  <p className="text-xs text-slate-400">Receive instructions to recover your account</p>
                </div>
              </div>
              <button
                onClick={() => setShowForgotModal(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {forgotSuccess ? (
              <div className="py-6 text-center space-y-3">
                <CheckCircle2 className="h-12 w-12 text-emerald-400 mx-auto animate-bounce" />
                <h4 className="text-base font-bold text-slate-100">Reset Link Sent!</h4>
                <p className="text-xs text-slate-400 max-w-xs mx-auto">
                  We sent password reset instructions to <strong className="text-slate-200">{forgotEmail}</strong>.
                </p>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                    Account Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                    <input
                      type="email"
                      required
                      placeholder="user@school.edu"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      className="w-full rounded-xl border border-slate-700/50 bg-slate-900/50 pl-10 pr-4 py-3 text-xs text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none transition"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!forgotEmail.trim()}
                  className={`w-full py-3.5 rounded-xl bg-gradient-to-r ${roleOption.badgeColor} text-xs font-bold text-white shadow-lg disabled:opacity-50 transition`}
                >
                  Send Reset Link
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
