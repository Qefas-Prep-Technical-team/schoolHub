import { ReactNode } from 'react';

interface ButtonProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
  icon?: ReactNode;
}

export default function Button({
  children,
  variant = 'outline',
  size = 'md',
  className = '',
  onClick,
  icon,
}: ButtonProps) {
  const baseClasses = 'flex items-center justify-center gap-x-2 rounded-lg font-medium tracking-[0.015em] transition-colors';
  
  const variantClasses = {
    primary: 'bg-primary text-white hover:bg-primary/90',
    secondary: 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700',
    outline: 'bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark text-text-light-primary dark:text-dark-primary hover:bg-gray-50 dark:hover:bg-white/5 shadow-sm',
    ghost: 'bg-transparent text-text-light-secondary dark:text-dark-secondary hover:bg-primary/10 hover:text-primary',
  };

  const sizeClasses = {
    sm: 'h-8 px-3 text-xs',
    md: 'h-10 px-4 text-sm',
    lg: 'h-12 px-6 text-base',
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      onClick={onClick}
    >
      {icon}
      {children}
    </button>
  );
}