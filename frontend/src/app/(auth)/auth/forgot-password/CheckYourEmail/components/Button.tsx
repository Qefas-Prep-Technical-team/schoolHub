// components/Button.tsx
"use client";

interface ButtonProps {
  text: string;
  variant: "primary" | "secondary" | "ghost";
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
}

export default function Button({ 
  text, 
  variant, 
  onClick, 
  disabled = false, 
  loading = false 
}: ButtonProps) {
  const baseStyles = "w-full flex justify-center items-center py-3 px-4 rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2";
  
  const variantStyles = {
    primary: "bg-primary text-white hover:bg-primary-dark focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed",
    secondary: "bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-500 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed",
    ghost: "text-primary hover:text-primary-dark focus:ring-primary underline bg-transparent hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
  };

  const loadingStyles = loading ? "opacity-70 cursor-not-allowed" : "";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseStyles} ${variantStyles[variant]} ${loadingStyles}`}
    >
      {loading ? (
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          <span>{text}</span>
        </div>
      ) : (
        text
      )}
    </button>
  );
}