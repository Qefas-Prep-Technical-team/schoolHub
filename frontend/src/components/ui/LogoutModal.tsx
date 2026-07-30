import React, { useState } from "react";
import { LogOut, RefreshCw, AlertTriangle, ShieldCheck } from "lucide-react";
import { getRoleTheme } from "@/lib/theme/roleTheme";

// Generic User type since web app doesn't have UserRecord imported directly everywhere
interface UserProps {
  email?: string;
  name?: string;
  role?: string | null;
  userType?: string;
}

interface LogoutModalProps {
  isOpen: boolean;
  user: UserProps | null;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export const LogoutModal: React.FC<LogoutModalProps> = ({
  isOpen,
  user,
  onClose,
  onConfirm,
}) => {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const roleTheme = getRoleTheme(user?.role || user?.userType);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setIsLoggingOut(true);
    try {
      await onConfirm();
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl space-y-6 overflow-hidden">
        {/* Top ambient glow bar matching role theme */}
        <div
          className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${roleTheme.gradientHeader}`}
        />

        {isLoggingOut ? (
          /* State 2: Logging Out Progress Indicator */
          <div className="py-6 text-center space-y-4 animate-in fade-in duration-300">
            <div
              className={`h-16 w-16 rounded-2xl ${roleTheme.avatarBg} flex items-center justify-center mx-auto shadow-lg shadow-indigo-500/20`}
            >
              <RefreshCw className="h-8 w-8 text-white animate-spin" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                Signing Out...
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Closing session and clearing local security tokens.
              </p>
            </div>
            <div className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 bg-slate-100 dark:bg-slate-800 text-[11px] text-slate-500 font-medium">
              <ShieldCheck className="h-3.5 w-3.5 text-indigo-500" />
              <span>Session secures automatically</span>
            </div>
          </div>
        ) : (
          /* State 1: Confirmation Prompt */
          <>
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 flex-shrink-0">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                  Sign Out of QefasHub?
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  You are about to log out of your{" "}
                  <strong className="text-slate-800 dark:text-slate-200">
                    {roleTheme.label}
                  </strong>{" "}
                  session ({user?.email || "User"}).
                </p>
              </div>
            </div>

            {/* User Details Pill */}
            <div className="flex items-center gap-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-3">
              <div
                className={`h-9 w-9 rounded-lg ${roleTheme.avatarBg} flex items-center justify-center font-bold text-white shadow-sm text-xs`}
              >
                {user?.name ? user.name.slice(0, 2).toUpperCase() : "SH"}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                  {user?.name || "School User"}
                </p>
                <span
                  className={`inline-block text-[10px] font-extrabold uppercase tracking-wider ${roleTheme.activeNavText}`}
                >
                  {roleTheme.label} Account
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className="flex items-center gap-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white px-5 py-2.5 text-xs font-bold shadow-md shadow-rose-600/20 transition cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
                <span>Yes, Sign Out</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
