"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShieldCheck, 
  MapPin, 
  Laptop, 
  Lock, 
  X, 
  Loader2, 
  ArrowRight,
  Sparkles,
  CheckCircle2
} from "lucide-react";
import { FcGoogle } from "react-icons/fc";

interface GoogleAuthConsentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProceed: (withLocation: boolean) => Promise<void>;
  isSubmitting: boolean;
  userType?: string;
  mode?: "signin" | "signup";
}

export default function GoogleAuthConsentModal({
  isOpen,
  onClose,
  onProceed,
  isSubmitting,
  userType = "student",
  mode = "signup",
}: GoogleAuthConsentModalProps) {
  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isSubmitting) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, isSubmitting]);

  const roleDisplay = userType.charAt(0).toUpperCase() + userType.slice(1).toLowerCase();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          {/* Backdrop with frosted blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => {
              if (!isSubmitting) onClose();
            }}
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-md cursor-pointer"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 14 }}
            transition={{ type: "spring", stiffness: 380, damping: 28 }}
            role="dialog"
            aria-modal="true"
            className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl shadow-2xl shadow-slate-900/40 p-6 sm:p-7 overflow-hidden z-10"
          >
            {/* Ambient Multi-Hue Glow Behind Header */}
            <div className="absolute -top-16 -right-16 w-48 h-48 bg-gradient-to-br from-blue-500/20 via-indigo-500/15 to-transparent blur-2xl rounded-full pointer-events-none" />
            <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-gradient-to-tr from-emerald-500/15 via-teal-500/10 to-transparent blur-2xl rounded-full pointer-events-none" />

            {/* Close Button */}
            {!isSubmitting && (
              <button
                type="button"
                onClick={onClose}
                className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                aria-label="Close dialog"
              >
                <X size={18} />
              </button>
            )}

            {/* Header with Security Badge */}
            <div className="flex items-start gap-4 mb-5">
              <div className="relative shrink-0 w-13 h-13 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/25">
                <ShieldCheck size={26} className="text-white" />
                <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900 flex items-center justify-center">
                  <Sparkles size={10} className="text-white" />
                </span>
              </div>
              <div className="min-w-0 pr-6">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200/60 dark:border-blue-800/60 text-blue-700 dark:text-blue-300 text-[11px] font-bold uppercase tracking-wider mb-1.5">
                  <Lock size={10} />
                  Security & Verification
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-tight">
                  Allow Device & Location Access
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Before continuing with Google {mode === "signup" ? `registration for ${roleDisplay}` : "sign-in"}, we request permission to collect accurate verification data.
                </p>
              </div>
            </div>

            {/* Informational Cards */}
            <div className="space-y-3 mb-6">
              {/* Feature 1: Location */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 flex items-start gap-3.5 transition-all">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin size={20} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
                      Approximate Location
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300">
                      City & Country
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                    Identifies your login region to safeguard your portal, detect suspicious access, and notify you of logins from unfamiliar locations.
                  </p>
                </div>
              </div>

              {/* Feature 2: Hardware Device Info */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 flex items-start gap-3.5 transition-all">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Laptop size={20} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
                      Hardware & Device Specs
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300">
                      Model & Browser
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                    Accurately records your smartphone or computer model so you can view, trust, and manage active sessions across your devices.
                  </p>
                </div>
              </div>
            </div>

            {/* Privacy Guarantee Note */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/40 text-[11px] text-blue-800 dark:text-blue-300 mb-6">
              <CheckCircle2 size={14} className="text-blue-600 dark:text-blue-400 shrink-0" />
              <span>
                Your privacy is protected. We never track your ongoing movement or share personal device data.
              </span>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5">
              {/* Primary: Allow & Continue */}
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => onProceed(true)}
                className="w-full h-13 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:via-indigo-500 hover:to-blue-600 text-white font-bold flex items-center justify-center gap-3 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/35 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed group"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2 text-sm">
                    <Loader2 size={18} className="animate-spin text-white" />
                    <span>Connecting to Google...</span>
                  </div>
                ) : (
                  <>
                    <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm">
                      <FcGoogle size={17} />
                    </div>
                    <span className="text-sm tracking-wide">
                      Allow & Continue with Google
                    </span>
                    <ArrowRight size={16} className="text-white/80 group-hover:translate-x-0.5 transition-transform" />
                  </>
                )}
              </button>

              {/* Secondary: Skip Location */}
              {!isSubmitting && (
                <button
                  type="button"
                  onClick={() => onProceed(false)}
                  className="w-full h-11 rounded-2xl text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-all cursor-pointer"
                >
                  Continue without Location Access
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
