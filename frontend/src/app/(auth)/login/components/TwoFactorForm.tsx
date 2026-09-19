"use client";
import { useState, useEffect } from "react";
import { useAuthStore } from "../services/auth-store";
import { useLogin2FAMutation, useSend2FAEmailMutation } from "../services/use-auth-mutations";
import { Button } from "@/components/ui/button";
import { Loader2, ShieldCheck, Mail, ArrowLeft, KeyRound, Smartphone } from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

export default function TwoFactorForm() {
  const [appCode, setAppCode] = useState("");
  const [emailCode, setEmailCode] = useState("");
  const [isFlipped, setIsFlipped] = useState(false);
  const [countdown, setCountdown] = useState(0);
  
  const user = useAuthStore((state) => state.user);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  
  const { mutate, isPending } = useLogin2FAMutation();
  const { mutate: sendEmail, isPending: isSendingEmail } = useSend2FAEmailMutation();

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleSendEmail = () => {
    if (user?.tempToken) {
      sendEmail({ tempToken: user.tempToken });
      setCountdown(60);
    }
  };

  const switchToEmail = () => {
    setIsFlipped(true);
    if (countdown === 0 && user?.tempToken) {
      handleSendEmail();
    }
  };
  
  const handleAppSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (appCode.length === 6 && user?.tempToken) {
      mutate({ tempToken: user.tempToken, code: appCode });
    }
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailCode.length === 6 && user?.tempToken) {
      mutate({ tempToken: user.tempToken, code: emailCode });
    }
  };

  const buttonColors: Record<string, string> = {
    TEACHER: "bg-[#8bc34a] hover:bg-[#7cb342] shadow-[#8bc34a]/20 focus:ring-[#8bc34a]/30",
    ADMIN: "bg-blue-600 hover:bg-blue-700 shadow-blue-600/20 focus:ring-blue-600/30",
    STUDENT: "bg-rose-600 hover:bg-rose-700 shadow-rose-600/20 focus:ring-rose-600/30",
    PARENT: "bg-amber-600 hover:bg-amber-700 shadow-amber-600/20 focus:ring-amber-600/30",
    USER: "bg-slate-800 hover:bg-slate-900 shadow-slate-800/20 focus:ring-slate-800/30",
  };

  const focusColors: Record<string, string> = {
    TEACHER: "focus:border-[#8bc34a] focus:ring-[#8bc34a]/10",
    ADMIN: "focus:border-blue-500 focus:ring-blue-500/10",
    STUDENT: "focus:border-rose-500 focus:ring-rose-500/10",
    PARENT: "focus:border-amber-500 focus:ring-amber-500/10",
    USER: "focus:border-slate-500 focus:ring-slate-500/10",
  };

  const btnTheme = buttonColors[user?.userType || "USER"] || buttonColors.USER;
  const focusTheme = focusColors[user?.userType || "USER"] || focusColors.USER;

  return (
    <div className="w-full flex justify-center relative perspective-1000" style={{ perspective: "1000px" }}>
      <div 
        className="w-full relative transition-transform duration-700"
        style={{ 
          transformStyle: "preserve-3d", 
          transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
          minHeight: "450px"
        }}
      >
        
        {/* FRONT: Authenticator App */}
        <div 
          className="absolute inset-0 w-full flex flex-col justify-between p-4 sm:p-2"
          style={{ backfaceVisibility: "hidden" }}
        >
          <div className="flex flex-col gap-3 text-center mb-10 items-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-2 shadow-sm border border-slate-200 dark:border-slate-700">
              <Smartphone className="w-8 h-8 text-slate-600 dark:text-slate-300" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Authenticator App</h2>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 max-w-[240px]">
              Enter the 6-digit code from your authenticator app
            </p>
          </div>

          <form onSubmit={handleAppSubmit} className="flex flex-col gap-6">
            <div className="flex flex-col items-center justify-center w-full mb-2">
              <InputOTP maxLength={6} value={appCode} onChange={setAppCode}>
                <InputOTPGroup className="gap-2 sm:gap-3 flex w-full justify-center">
                  {[0, 1, 2, 3, 4, 5].map((index) => (
                    <InputOTPSlot 
                      key={index} 
                      index={index} 
                      className="w-12 h-14 sm:w-14 sm:h-16 text-2xl font-black rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 shadow-sm focus:ring-2 focus:border-transparent transition-all" 
                    />
                  ))}
                </InputOTPGroup>
              </InputOTP>
            </div>

            <div className="flex flex-col gap-3 items-center">
              <button 
                type="submit"
                className={`flex w-[85%] h-11 items-center justify-center rounded-full text-sm font-bold text-white shadow-md transition-all duration-300 active:scale-[0.98] focus:outline-none focus:ring-4 disabled:opacity-50 disabled:cursor-not-allowed ${btnTheme}`}
                disabled={isPending || appCode.length !== 6}
              >
                {isPending && !isFlipped ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Verify and Login
              </button>
              
              <button
                type="button"
                className="w-[85%] h-11 rounded-full font-bold text-sm text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                onClick={switchToEmail}
              >
                Use Email Instead
              </button>
            </div>
          </form>

          <div className="flex flex-col gap-3 mt-2 items-center">
            <button
              type="button"
              className="w-[85%] h-11 rounded-full font-bold text-sm text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              onClick={() => clearAuth()}
            >
              Cancel & Back to Login
            </button>
          </div>
        </div>

        {/* BACK: Email Verification */}
        <div 
          className="absolute inset-0 w-full flex flex-col justify-between p-4 sm:p-2"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <div className="flex flex-col gap-3 text-center mb-10 items-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-2 shadow-sm border border-slate-200 dark:border-slate-700">
              <Mail className="w-8 h-8 text-slate-600 dark:text-slate-300" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Email Verification</h2>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 max-w-[240px]">
              Receive a 6-digit code in your email
            </p>
          </div>

          <form onSubmit={handleEmailSubmit} className="flex flex-col gap-6">
            <div className="flex flex-col items-center justify-center w-full mb-2">
              <InputOTP maxLength={6} value={emailCode} onChange={setEmailCode}>
                <InputOTPGroup className="gap-2 sm:gap-3 flex w-full justify-center">
                  {[0, 1, 2, 3, 4, 5].map((index) => (
                    <InputOTPSlot 
                      key={index} 
                      index={index} 
                      className="w-12 h-14 sm:w-14 sm:h-16 text-2xl font-black rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 shadow-sm focus:ring-2 focus:border-transparent transition-all" 
                    />
                  ))}
                </InputOTPGroup>
              </InputOTP>
            </div>

            <div className="flex w-full justify-center">
              <button 
                type="submit"
                className={`flex h-11 w-[85%] items-center justify-center rounded-full text-sm font-bold text-white shadow-lg transition-all duration-300 active:scale-[0.98] focus:outline-none focus:ring-4 disabled:opacity-50 disabled:cursor-not-allowed ${btnTheme}`}
                disabled={isPending || emailCode.length !== 6}
              >
                {isPending && isFlipped ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Verify and Login
              </button>
            </div>
          </form>

          <div className="flex flex-col items-center mt-6 mb-2">
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
              {countdown > 0 ? (
                <>Next code allowed in <span className="font-bold text-slate-700 dark:text-slate-200">{countdown}s</span></>
              ) : (
                <button
                  type="button"
                  onClick={handleSendEmail}
                  disabled={isSendingEmail || !user?.tempToken}
                  className="font-bold text-slate-700 dark:text-slate-200 hover:underline disabled:opacity-50 transition-all"
                >
                  {isSendingEmail ? "Sending..." : "Didn't receive a code? Resend"}
                </button>
              )}
            </p>
          </div>

          <div className="flex flex-col gap-4 items-center w-full">
            <div className="relative w-full">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-100 dark:border-slate-800/50" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest text-slate-400">
                <span className="bg-white dark:bg-slate-900 px-4">Or</span>
              </div>
            </div>

            <button
              type="button"
              className="w-[85%] h-11 rounded-full font-bold text-sm text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              onClick={() => setIsFlipped(false)}
            >
              Use Authenticator App Instead
            </button>
            
            <button
              type="button"
              className="w-[85%] h-11 rounded-full font-bold text-sm text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              onClick={() => clearAuth()}
            >
              Cancel & Back to Login
            </button>
          </div>
        </div>
        
      </div>
    </div>
  );
}
