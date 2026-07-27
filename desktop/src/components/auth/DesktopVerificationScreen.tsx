import React, { useState } from "react";
import { useAuthStore } from "../../store/useAuthStore";
import { getRoleTheme } from "../../theme/roleTheme";
import { ShieldCheck, RefreshCw, AlertCircle, ArrowLeft, CheckCircle2 } from "lucide-react";
import { AuthHeaderControls } from "./AuthHeaderControls";

interface DesktopVerificationScreenProps {
  onBack: () => void;
  onSuccess: () => void;
}

export const DesktopVerificationScreen: React.FC<DesktopVerificationScreenProps> = ({ onBack, onSuccess }) => {
  const { verificationPending, verifyCode, resendCode, isLoading, authError } = useAuthStore();
  const [code, setCode] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);

  if (!verificationPending) {
    return null;
  }

  const roleTheme = getRoleTheme(verificationPending.userType);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) return;

    const ok = await verifyCode(code);
    if (ok) {
      setIsSuccess(true);
      setTimeout(() => {
        onSuccess();
      }, 1500);
    }
  };

  const handleResend = async () => {
    setResendMessage("Resending code...");
    const ok = await resendCode();
    if (ok) {
      setResendMessage("New 6-digit code sent to your email!");
    } else {
      setResendMessage("Failed to resend code.");
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto space-y-6 animate-in fade-in zoom-in-95 duration-300">
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/50 backdrop-blur-md px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Sign In</span>
        </button>
        <AuthHeaderControls />
      </div>

      <div className="relative rounded-2xl border border-slate-200 dark:border-slate-700/50 bg-white/90 dark:bg-slate-900/80 p-8 md:p-10 shadow-lg dark:shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] space-y-8 backdrop-blur-xl">
        {isSuccess ? (
          <div className="py-8 text-center space-y-4">
            <div className="h-16 w-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-10 w-10 text-emerald-500 dark:text-emerald-400 animate-bounce" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Verification Successful!</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Signing you into your workspace...</p>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3">
              <div className={`h-12 w-12 rounded-xl ${roleTheme.avatarBg} flex items-center justify-center shadow-lg`}>
                <ShieldCheck className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                  {verificationPending.isDeviceVerification ? "Verify New Device" : "Verify Email Address"}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  We sent a 6-digit confirmation code to{" "}
                  <strong className="text-slate-900 dark:text-slate-200">{verificationPending.email}</strong>.
                </p>
              </div>
            </div>

            {authError && (
              <div className="flex items-center gap-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800/80 p-3.5 text-xs text-rose-700 dark:text-rose-300 shadow-md">
                <AlertCircle className="h-4 w-4 text-rose-500 dark:text-rose-400 flex-shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            {resendMessage && (
              <div className="rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/80 p-3 text-xs text-indigo-700 dark:text-indigo-300 text-center font-medium">
                {resendMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2 text-center">
                <label className="text-[10px] font-extrabold text-slate-600 dark:text-slate-400 uppercase tracking-widest block">
                  Enter 6-Digit Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  placeholder="123456"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                  className="w-48 mx-auto text-center tracking-[0.5em] font-mono text-2xl font-bold rounded-xl border border-slate-200 dark:border-slate-700/50 bg-slate-50 dark:bg-slate-900/50 px-4 py-3 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || code.length !== 6}
                className={`w-full py-3.5 rounded-xl bg-gradient-to-r ${roleTheme.gradientHeader} text-sm font-bold text-white shadow-lg disabled:opacity-50 transition flex items-center justify-center gap-2`}
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <span>Verify & Continue</span>
                )}
              </button>
            </form>

            <div className="text-center pt-2 text-xs text-slate-400">
              <span>Didn&apos;t receive the code?</span>{" "}
              <button
                type="button"
                onClick={handleResend}
                className={`font-bold ${roleTheme.activeNavText} hover:underline transition-colors ml-1`}
              >
                Resend Code
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
