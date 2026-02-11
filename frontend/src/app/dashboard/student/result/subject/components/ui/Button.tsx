import { ReactNode } from 'react';

interface ButtonProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
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
  const baseClasses = 'flex items-center justify-center gap-x-2 rounded-lg font-medium tracking-[0.015em] transition-colors shadow-sm';
  
  const variantClasses = {
    primary: 'bg-primary text-white hover:bg-primary/90',
    secondary: 'bg-card-light dark:bg-card-dark text-text-light dark:text-text-dark border border-border-light dark:border-border-dark hover:bg-gray-50 dark:hover:bg-white/5',
    outline: 'bg-transparent text-text-light dark:text-text-dark hover:bg-primary/10',
  };

  const sizeClasses = {
    sm: 'h-8 px-3 text-xs',
    md: 'h-9 px-4 text-sm',
    lg: 'h-10 px-6 text-base',
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