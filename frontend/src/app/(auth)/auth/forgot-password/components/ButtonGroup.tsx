// components/ButtonGroup.tsx
"use client";
import Link from "next/link";

interface ButtonGroupProps {
  isPending: boolean;
  isValid: boolean;
  onSubmit: () => void;
}

export default function ButtonGroup({ isPending, isValid, onSubmit }: ButtonGroupProps) {
  const isSubmitDisabled = isPending || !isValid;

  return (
    <div className="flex flex-col gap-4">
      <button
        type="button" // Changed to button since form is handled by parent
        onClick={onSubmit}
        disabled={isSubmitDisabled}
        className="group relative flex h-14 w-full cursor-pointer items-center justify-center rounded-xl bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 dark:from-indigo-500 dark:via-blue-500 dark:to-indigo-600 text-base font-bold text-white shadow-lg shadow-indigo-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/40 hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-indigo-500/30 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none overflow-hidden"
      >
        <div className="absolute inset-0 w-full h-full bg-white/10 group-hover:bg-white/20 transition-colors duration-300" />
        <div className="relative z-10 flex items-center justify-center">
          {isPending ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
              Sending Reset Link...
            </>
          ) : (
            "Send Reset Link"
          )}
        </div>
      </button>
      
      <Link 
        href="/login" 
        className="text-center text-gray-500 dark:text-gray-400 text-sm underline cursor-pointer hover:text-primary transition-colors duration-200"
      >
        Back to Login
      </Link>
    </div>
  );
}
