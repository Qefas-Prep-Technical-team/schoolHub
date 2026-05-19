import React from "react";
import { X, AlertTriangle, Sparkles, Loader2 } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDanger?: boolean;
  isLoading?: boolean;
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isDanger = false,
  isLoading = false
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in"
        onClick={isLoading ? undefined : onClose}
      />

      {/* Dialog container */}
      <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-slate-950 p-6 shadow-2xl border border-slate-100 dark:border-white/10 animate-in zoom-in-95 duration-200 z-10">
        {/* Close Button */}
        {!isLoading && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-655 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={16} />
          </button>
        )}

        {/* Content */}
        <div className="flex flex-col items-center text-center mt-2">
          {/* Icon */}
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${
              isDanger
                ? "bg-red-50 dark:bg-red-950/20 text-red-500"
                : "bg-blue-50 dark:bg-blue-900/30 text-blue-500"
            }`}
          >
            {isLoading ? (
              <Loader2 className="animate-spin" size={24} />
            ) : isDanger ? (
              <AlertTriangle size={24} />
            ) : (
              <Sparkles size={24} />
            )}
          </div>

          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
            {title}
          </h3>
          
          <p className="text-sm text-slate-550 dark:text-slate-400 leading-relaxed mb-6">
            {message}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            type="button"
            disabled={isLoading}
            onClick={onClose}
            className="flex-1 h-11 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cancelText}
          </button>
          
          <button
            type="button"
            disabled={isLoading}
            onClick={onConfirm}
            className={`flex-grow flex-1 h-11 px-4 text-white rounded-xl text-sm font-bold transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
              isDanger
                ? "bg-red-600 hover:bg-red-700 shadow-red-500/10"
                : "bg-primary hover:bg-primary/95 shadow-blue-500/10"
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
