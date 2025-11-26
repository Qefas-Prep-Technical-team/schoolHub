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
        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
      >
        {isPending ?
         <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
             Sending Reset Link...
          </div>
        
          : "Send Reset Link"}
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