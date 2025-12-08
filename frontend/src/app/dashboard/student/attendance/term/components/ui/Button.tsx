// src/components/UI/Button.tsx
import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  icon?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  icon,
  size = 'md',
  className = '',
  onClick,
}) => {
  const baseClasses = 'flex items-center justify-center gap-2 rounded-lg shadow-sm hover:transition-colors';
  
  const sizeClasses = {
    sm: 'h-9 px-3 text-sm font-medium',
    md: 'h-10 px-4 text-sm font-medium',
    lg: 'h-11 px-5 text-sm font-medium',
  };

  const variantClasses = {
    primary: 'bg-primary text-white hover:bg-primary/90',
    secondary: 'bg-background-light dark:bg-slate-700 border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600',
    outline: 'bg-transparent border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700',
    ghost: 'bg-transparent hover:bg-slate-100 dark:hover:bg-slate-700',
  };

  return (
    <button
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      onClick={onClick}
    >
      {icon && <span className="material-symbols-outlined text-base">{icon}</span>}
      <span>{children}</span>
    </button>
  );
};

export default Button;