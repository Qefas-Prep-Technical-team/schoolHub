"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { LogOut, RefreshCw, AlertTriangle, ShieldCheck, X } from "lucide-react";
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
  const [mounted, setMounted] = useState(false);
  const roleTheme = getRoleTheme(user?.role || user?.userType);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle ESC key to dismiss
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isLoggingOut) {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isLoggingOut, onClose]);

  // Lock background scroll when open
  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  const handleConfirm = async () => {
    setIsLoggingOut(true);
    try {
      await onConfirm();
    } finally {
      setIsLoggingOut(false);
    }
  };

  const modalContent = (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="logout-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isLoggingOut) {
          onClose();
        }
      }}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200 touch-manipulation"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl space-y-6 overflow-hidden"
      >
        {/* Top ambient glow bar matching role theme */}
        <div
          className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${roleTheme.gradientHeader}`}
        />

        {/* Close Button */}
        {!isLoggingOut && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onClose();
            }}
            aria-label="Close dialog"
            className="absolute top-4 right-4 z-10 min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition-all cursor-pointer touch-manipulation"
          >
            <X className="h-4 w-4" />
          </button>
        )}

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
            <div className="flex items-start gap-4 pr-8">
              <div className="h-12 w-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 flex-shrink-0">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3
                  id="logout-modal-title"
                  className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight"
                >
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
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onClose();
                }}
                disabled={isLoggingOut}
                className="min-h-[44px] min-w-[90px] rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 px-5 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 transition-all select-none cursor-pointer touch-manipulation disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={isLoggingOut}
                className="min-h-[44px] flex items-center justify-center gap-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white px-5 py-2.5 text-xs font-bold shadow-md shadow-rose-600/20 transition-all select-none cursor-pointer touch-manipulation disabled:opacity-50"
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

  return createPortal(modalContent, document.body);
};
